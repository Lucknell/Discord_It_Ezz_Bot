FROM itezz_base:v1
MAINTAINER <lucknell3@gmail.com>
COPY . /src/bot
CMD ["node", "it-ezz.js"] 