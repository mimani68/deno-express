import axiod from "https://deno.land/x/axiod/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

export function getData() {
	axiod.get("https://jsonplaceholder.typicode.com/todos/1").then((response) => {
		 log.info(response)
	});
}
