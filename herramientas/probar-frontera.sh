#!/usr/bin/env bash
# La frontera que sabe fallar: comprueba que el lint de verdad detecta un import que
# cruza una frontera de la estructura, y que lo detecta por la razón exacta.
#
# Qué hace, en una COPIA temporal del proyecto (tu carpeta no se toca):
#
#   1. CONTROL. Con el proyecto tal como está. Tiene que compilar (tsc -b),
#      construir (vite build) y pasar el lint sin un solo error. Si no, el
#      experimento está mal montado (falta «npm ci») o tu proyecto ya cruza una
#      frontera, y lo demás no probaría nada: se para en rojo.
#   2. VIOLACIÓN. Se siembra en el carrito un componente que importa el ticket de
#      la funcionalidad de pedidos: una funcionalidad que importa las tripas de otra.
#   3. VIOLACIÓN. Se siembra en un átomo de ui un import del cliente de la API: una
#      pieza visual que sabe del negocio.
#   4. ARCHIVO SUELTO. Se siembra un archivo en src/, fuera de toda carpeta con papel.
#
#   Cada siembra tiene que COMPILAR y CONSTRUIR: para TypeScript y para Vite no hay
#   nada malo. Y el lint tiene que FALLAR con un solo error, de la regla esperada,
#   en el archivo sembrado y con el mensaje esperado. Si una siembra pasa el lint,
#   esa parte de la frontera no existe. Si no compila, o falla por otra cosa,
#   tampoco demuestra nada. En los dos casos sale en rojo.
#
# Uso:  bash herramientas/probar-frontera.sh   → sale 0 si la frontera se sostiene
#
# Por qué así: un experimento que solo espera un rojo se pone «verde» también
# cuando falla por la razón equivocada. Lo impiden tres cosas: el control demuestra
# que el lint corre y pasa con el proyecto limpio; cada siembra exige que el código
# compile y construya; y el resultado se lee del informe JSON de ESLint (cuántos
# archivos revisó, cuántos errores, de qué regla, en qué archivo), no de su código
# de salida.
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"

[ -x "$raiz/node_modules/.bin/eslint" ] || {
  echo "❌ falta node_modules/.bin/eslint: corre «npm ci» antes de este guion" >&2
  exit 1
}

tmp="$(cd "$(mktemp -d)" && pwd -P)"
# Al salir se borra la copia, y el código de salida se conserva. Con el bash 3.2
# que trae macOS, si el guion se corta por una variable sin definir (set -u), la
# trampa puede recibir un 0: sin la bandera «terminado», un guion cortado a la
# mitad saldría 0, un falso verde. Por eso, si no llegó al final, sale 1.
salir() {
  local codigo=$?
  rm -rf "$tmp"
  if [ "$codigo" -eq 0 ] && [ "${terminado:-}" != 1 ]; then
    echo "❌ el guion se cortó antes de terminar" >&2
    codigo=1
  fi
  exit "$codigo"
}
trap salir EXIT

# La copia: todo menos lo que se rehace. Las dependencias se enlazan una por una, no
# se copian; la carpeta .tmp, donde «tsc -b» guarda lo que ya revisó, no se enlaza:
# la copia lleva la suya, para que la revisión de la copia no use la de tu proyecto.
copia="$tmp/proyecto"
mkdir -p "$copia/node_modules"
(cd "$raiz" && tar cf - --exclude ./node_modules --exclude ./dist --exclude ./coverage --exclude ./.git .) |
  (cd "$copia" && tar xf -)
for dependencia in "$raiz"/node_modules/* "$raiz"/node_modules/.bin; do
  ln -s "$dependencia" "$copia/node_modules/"
done
cd "$copia"

bin="$copia/node_modules/.bin"

# compila_y_construye: tsc -b y vite build tienen que salir bien.
compila_y_construye() {
  if ! "$bin/tsc" -b >"$tmp/tsc.log" 2>&1; then
    echo "   ❌ tsc no compiló; esto no demuestra la frontera:"
    sed 's/^/     /' "$tmp/tsc.log" | head -n 10
    return 1
  fi
  if ! "$bin/vite" build --logLevel error --outDir "$tmp/dist" --emptyOutDir >"$tmp/vite.log" 2>&1; then
    echo "   ❌ vite no construyó; esto no demuestra la frontera:"
    sed 's/^/     /' "$tmp/vite.log" | head -n 10
    return 1
  fi
}

# lint: corre ESLint sobre src/ y deja en $tmp/lint.txt un resumen de su informe
# JSON: una primera línea «archivos=N errores=M» y, después, un renglón por error
# con «regla|archivo|mensaje». El código de salida de ESLint no se usa.
lint() {
  "$bin/eslint" src --format json --output-file "$tmp/lint.json" >/dev/null 2>&1 || true
  [ -s "$tmp/lint.json" ] || {
    echo "   ❌ ESLint no escribió su informe"
    return 1
  }
  node -e '
    const informe = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    const raiz = process.argv[2] + "/";
    const errores = [];
    for (const archivo of informe)
      for (const m of archivo.messages)
        if (m.severity === 2)
          errores.push([m.ruleId, archivo.filePath.replace(raiz, ""), m.message].join("|"));
    console.log(`archivos=${informe.length} errores=${errores.length}`);
    for (const e of errores) console.log(e);
  ' "$tmp/lint.json" "$copia" >"$tmp/lint.txt"
}

# siembra: revisa que el lint falle con UN error, de la regla, en el archivo y con
# el mensaje esperados.
exige_un_error() {
  local regla="$1" archivo="$2" mensaje="$3" resumen
  resumen="$(head -n 1 "$tmp/lint.txt")"
  if [ "$resumen" = "${resumen%errores=1}" ]; then
    echo "   ❌ se esperaba un solo error del lint y hubo otra cosa ($resumen):"
    tail -n +2 "$tmp/lint.txt" | sed 's/^/     /'
    return 1
  fi
  local linea
  linea="$(sed -n 2p "$tmp/lint.txt")"
  case "$linea" in
    "$regla|$archivo|"*"$mensaje"*) ;;
    *)
      echo "   ❌ el lint falló, pero NO por la razón esperada. Esto no demuestra la frontera:"
      echo "     $linea"
      return 1
      ;;
  esac
  echo "   ✅ compiló y construyó, y el lint falló con un solo error, en $archivo:"
  echo "     ${linea##*|}"
}

echo "1/4 control: el proyecto tal como está"
compila_y_construye
lint
resumen="$(head -n 1 "$tmp/lint.txt")"
archivos="${resumen#archivos=}"
archivos="${archivos%% *}"
if [ "$resumen" != "${resumen%errores=0}" ] && [ "$archivos" -gt 0 ]; then
  echo "   ✅ compiló, construyó y el lint revisó $archivos archivos sin un error"
else
  echo "❌ el control NO pasó: tu proyecto, tal como está, ya rompe una regla del lint ($resumen):"
  tail -n +2 "$tmp/lint.txt" | sed 's/^/     /'
  exit 1
fi

echo "2/4 violación: el carrito importa el ticket de la funcionalidad de pedidos"
sembrado="src/features/carrito/components/VistaPrevia.tsx"
cat >"$sembrado" <<'TSX'
import { TicketDelPedido } from "../../pedidos/components/TicketDelPedido";

export function VistaPrevia(props: Parameters<typeof TicketDelPedido>[0]) {
  return <TicketDelPedido {...props} />;
}
TSX
compila_y_construye
lint
exige_un_error "boundaries/dependencies" "$sembrado" "importa las tripas de pedidos"
rm "$sembrado"

echo "3/4 violación: un átomo de ui importa el cliente de la API"
atomo="src/shared/components/ui/Boton.tsx"
cp "$atomo" "$tmp/Boton.tsx"
{
  echo 'import { pedirJson } from "../../api/cliente";'
  cat "$tmp/Boton.tsx"
  echo 'export const sembrado = pedirJson;'
} >"$atomo"
compila_y_construye
lint
exige_un_error "boundaries/dependencies" "$atomo" "ui no puede importar de api"
cp "$tmp/Boton.tsx" "$atomo"

echo "4/4 archivo suelto: un archivo en src/, fuera de toda carpeta con papel"
suelto="src/Utilidades.ts"
echo 'export const IVA = 0.16;' >"$suelto"
compila_y_construye
lint
exige_un_error "boundaries/no-unknown-files" "$suelto" "does not belong to any known element"
rm "$suelto"

echo "✅ frontera: se sostiene (las tres siembras compilaron, construyeron y el lint las detuvo, cada una por su razón)"
terminado=1
