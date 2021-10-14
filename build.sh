#!/bin/bash
docker cp itezz:/src/bot/config/ .
docker rm --force itezz
docker build -t itezz:v1 .
docker run -d --restart=always --name itezz itezz:v1
# https://discordapp.com/oauth2/authorize?client_id=749089105241178173 &scope=bot&permissions=97344
# docker exec -it itezz bash
# docker logs --follow itezz