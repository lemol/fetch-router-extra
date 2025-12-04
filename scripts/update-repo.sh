# REMIX_SOURCE

cp -rf ${REMIX_SOURCE}/src/* ./src/
cp -rf ${REMIX_SOURCE}/{package.json,README.md} ./

find . -name "package.json" -o -name "*.ts" -path "*/src/*" | \
xargs sed -i '' 's/@remix-run\/fetch-router-extra/fetch-router-extra/g'

sed -i ''  's/workspace:\^/0/g' package.json

rm -rf node_modules
rm -rf pnpm-lock.yaml

pnpm update
