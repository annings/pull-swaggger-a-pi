/**
 * 从 swagger/openapi json 文件生成 ts/js 代码。
 *
 * 为避免重复，使用 method + path 作为函数名，`_` 作为分隔符。例如
 *
 * POST /hello/world   --> post_hello_world
 * GET  /user/{id}     --> get_user_$id$
 * GET  /user/{id}/foo --> get_user_$id$_foo
 */
const fs = require('fs');
const path = require('path');
// const swagaync = require('swagger-sync');

const { genFromData } = require('swagger-codegen-ts');

const filePath = path.join(__dirname, './src/config/openapi.json');
const outputDir = path.join(__dirname, './src/services/api/');

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

genFromData(
    {
        outputDir,
        hook: {
            customFunctionName(cdata) {
                const name = `${cdata.method.toLowerCase()}${cdata.path.replace(
                    /^\/api/,
                    ''
                )}`;
                return name.replace(/[\/-]/g, '_').replace(/[{}]/g, '$');
            }
        }
    },
    data
)
    .then(() => process.exit(0))
    .catch(error => console.log('err:\n', error));
