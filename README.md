# Sample Deno Application

```bash
docker run \
 --name deno-sample \
 -it \
 --rm \
 -p 3000:3000 \
 -v ${PWD}:/app \
 -w /app \
 hayd/alpine-deno:1.10.2 run --allow-net server.ts
```
of 

```bash
docker-compose -p deno up
```