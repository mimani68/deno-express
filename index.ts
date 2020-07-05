import * as log from "https://deno.land/std/log/mod.ts";
import isEmpty from "https://deno.land/x/lodash/isEmpty.js";
import { name } from './user.class.ts';
import { getData } from './data.service.ts';

interface UserDto {
	name: string;
	token: string;
}

// console.log(bgBlue(red(bold(`Hello ${name}!`))));
log.debug("Hello world");
log.info("Hello world");
log.info(isEmpty(null));
getData();
