FROM hayd/alpine-deno:1.10.2

WORKDIR /app

USER deno

COPY . .

EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "server.ts"]