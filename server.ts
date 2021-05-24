import { opine } from "https://deno.land/x/opine@1.4.0/mod.ts";

const app = opine();
const PORT = 3000;

app.get("/", function(req, res) {
  res.json({
    title: "Hello World"
  });
});

app.listen(PORT, () => console.log("server has started on http://localhost:" + PORT + " 🚀"));
