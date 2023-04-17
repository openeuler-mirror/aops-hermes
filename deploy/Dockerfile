FROM openeuler/openeuler:22.03-lts-sp1 as OS
COPY ./aops-hermes.repo /app
WORKDIR /app
RUN dnf install aops-hermes -y --setopt=reposdir=/app

FROM nginx:1.20.0
COPY --from=OS /opt/aops/web/dist /app
WORKDIR /app
RUN chmod -R 755 /app
COPY --from=OS /app/aops-nginx.conf /etc/nginx/
ENV RUN_USER nginx
ENV RUN_GROUP nginx
EXPOSE 80
ENTRYPOINT ["nginx", "-c", "/etc/nginx/aops-nginx.conf", "-g", "daemon off;"]
