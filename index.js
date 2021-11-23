const request = require("request");
const path = require("path");
const chalk = require("chalk");

const openapiFilePath = path.resolve(process.cwd(), "src/config/openapi.json");
const packageFilePath = path.resolve(process.cwd(), "package.json");
const fs = require("fs");
// 读取 package.json 获取 apiDocPath
const apiDocPath = JSON.parse(
  fs.readFileSync(packageFilePath, "utf-8")
).apiDocPath;

// console.log('执行', apiDocPath);

!apiDocPath && console.log(chalk.red(`package.json未配置apiDocPath属性`));
function compareData(newData, oldData) {
  return new Promise((resolve) => {
    if (oldData) {
      const newDataPaths = Object.keys(newData.paths);
      newDataPaths.forEach((p) => {
        const id = getOperationId(newData.paths[p]);
        const inOldPath = getPathByOperationId(id, oldData);
        // 新的数据OperationId  在老数据中没找到path
        if (inOldPath === "") {
          console.log(chalk.red(`新增API：${p}`));
        } else if (inOldPath !== p) {
          console.log(chalk.red(`修改了API：${inOldPath} => ${p}`));
        }
      });
    }
    resolve(true);
  });
}
function getOperationId(data) {
  var _a, _b, _c;
  return (
    ((_a = data.get) === null || _a === void 0 ? void 0 : _a.operationId) ||
    ((_b = data.post) === null || _b === void 0 ? void 0 : _b.operationId) ||
    ((_c = data.put) === null || _c === void 0 ? void 0 : _c.operationId)
  );
}
function getPathByOperationId(id, data) {
  let result = "";
  const arr = [];
  data.paths &&
    Object.keys(data.paths).forEach((p) => {
      if (getOperationId(data.paths[p]) === id) {
        arr.push({
          [p]: id,
        });
        result = p;
      }
    });
  if (arr.length > 1) {
    console.log(chalk.red(`getOperationId为${id}存在多个path`));
  }
  return result;
}

try {
  const fileData = fs.readFileSync(openapiFilePath, "utf-8");
  const oldData = fileData ? JSON.parse(fileData) : {};
  // 等待操作结果返回，然后打印结果
  console.log(chalk.green("-------读取文件--------------"));
  request(
    {
      method: "GET",
      uri: apiDocPath,
    },
    (error, response, body) => {
      if (error) {
        console.log("读取文件", chalk.red(error));
      }
      if (response && response.statusCode !== 200) {
        console.log("读取文件", chalk.red(error));
      }
      console.log(chalk.green("-------获取数据成功--------------"));
      try {
        const newData = JSON.parse(body);
        // 读取本地文件
        compareData(newData, oldData)
          .then((r) => {
            if (r) {
              console.log(chalk.green("-------正在写入文件--------------"));
              // 异步写入数据到文件
              fs.writeFile(
                openapiFilePath,
                JSON.stringify(newData, null, 4),
                { encoding: "utf8" },
                () => {
                  console.log(chalk.green("-------写入文件完成--------------"));
                }
              );
            }
          })
          .catch((err) => {
            console.log(chalk.red(err));
          });
      } catch (e) {
        console.log(chalk.red(e.message));
      }
    }
  );
} catch (e) {
  console.log("结果", chalk.red(e));
}
