import express from "express";
import cors from "cors";
import { selectDB } from "./db";
const app = express();
const PORT = 4000;

app.use(cors());

app.get("/query/withdraw", async (req, res) => {
  const sql = req.query.sql as string;
  const params = req.query.params as any[];
  console.log("sql:", sql);
  console.log("params: ", params);
  try {
    const data = await selectDB(sql, params || []);
    res.send({
      success: true,
      data: data,
    });
  } catch (error) {
    res.send({
      success: false,
      data: "query failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server runing on port: ${PORT}`);
});
