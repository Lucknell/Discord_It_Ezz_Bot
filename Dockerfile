FROM itezz_base:v1
MAINTAINER <lucknell3@gmail.com>
COPY --chown=itezz:itezz . /src/bot
CMD ["node", "it-ezz.js"] 