import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Internship Tracker Backend listening on port ${port}`);
});
