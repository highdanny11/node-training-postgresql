require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")

const examStringNotEmpty = (val) => {
  if (typeof val !== 'string') {
    return false
  }
  if (val.trim().length === 0 || val === '') {
    return false;
  }
  return true
}

const examIntNotEmpty = (val) => {
  if (typeof val !== 'number') {
    return false
  }
  if (val < 0 || val % 0) {
    return false
  }
  return true
}

const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  }

  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const creditPackage = await AppDataSource.getRepository("CreditPackage").find({
        select: ['id', 'name', 'credit_amount', 'price']
      })
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: 'success',
        data: creditPackage
      }))
      res.end()
    } catch (e) {
      console.log(e)
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on('end', async () => {
      const {
        name, credit_amount, price
      } = JSON.parse(body)
      try {
        const creditPackage = await AppDataSource.getRepository("CreditPackage")
        if (examStringNotEmpty(name) && examIntNotEmpty(credit_amount) && examIntNotEmpty(price)) {
          const existData = await creditPackage.find({
            where: {
              name: name
            }
          })
          if (existData.length) {
            res.writeHead(409, headers)
            res.write(JSON.stringify({
              status: "failed",
              message: "資料重複"
            }))
            res.end()
            return
          }
          const newData = await creditPackage.create({
            name, credit_amount, price
          })
          const result = await creditPackage.save(newData)
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: 'success',
            data: result
          }))
          res.end()
        } else {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end()
          return
        }
      } catch (e) {
        console.log(e)
        res.writeHead(500, headers)
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }))
        res.end()
      }
    })

  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    const id = req.url.split('/').pop()
    if (!examStringNotEmpty(id)) {
      res.writeHead(400, headers)
      res.write(JSON.stringify({
        status: "failed",
        message: "ID錯誤"
      }))
      res.end()
    }
    try {
      const result = await AppDataSource.getRepository("CreditPackage").delete(id)
      if (!result.affected) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success"
      }))
      res.end()
    } catch (e) {
      console.log(e)
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "GET") {
    try {
      const skillList = await AppDataSource.getRepository("SKILL").find({
        select: ['id', 'name']
      })
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: 'success',
        data: skillList
      }))
      res.end()
    } catch (e) {
      console.log(e)
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on('end', async () => {
      const { name } = JSON.parse(body)
      try {
        if (examStringNotEmpty(name)) {
          const skill = await AppDataSource.getRepository("SKILL")
          const exist = await skill.find({
            where: {
              name: name
            }
          })
          if (exist.length) {
            res.writeHead(409, headers)
            res.write(JSON.stringify({
              status: "failed",
              message: "資料重複"
            }))
            res.end()
            return
          }
          const newData = await skill.create({ name })
          const result = await skill.save(newData)
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            status: 'success',
            data: result
          }))
          res.end()
        } else {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end()
          return
        }
      } catch (e) {
        console.log(e)
        res.writeHead(500, headers)
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }))
        res.end()
      }
    })
  } else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE") {
    const id = req.url.split('/').pop()
    if (!examStringNotEmpty(id)) {
      res.writeHead(400, headers)
      res.write(JSON.stringify({
        status: "failed",
        message: "ID錯誤"
      }))
      res.end()
    }
    try {
      const result = await AppDataSource.getRepository("SKILL").delete(id)
      if (!result.affected) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success"
      }))
      res.end()
    } catch (e) {
      console.log(e)
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: "failed",
      message: "無此網站路由",
    }))
    res.end()
  }
}

const server = http.createServer(requestListener)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();
