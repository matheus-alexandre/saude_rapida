FROM mariadb:latest

RUN apt update -y
RUN apt upgrade -y

COPY ./etc/conf.d/my.cnf /etc/mysql/my.cnf
RUN mkdir /etc/mysql/mysql.conf.d
RUN chown -R mysql:mysql /var/log/mysql

COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 3308
