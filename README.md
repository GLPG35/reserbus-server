# ReserBus Server

Rest API to manage users and reservations of buses.

# Cómo configurar e instalar

Lista de requerimientos

- [git](https://git-scm.com/downloads)
- [Bun.sh](https://bun.sh/)
- MySQL o MariaDB

Una vez instalados los requerimientos procedermos a abrir nuestra terminal de preferencia y pegar los siguientes comandos:

> git clone https://github.com/GLPG35/reserbus-server

> cd reserbus-server

> bun install

Con eso quedarían todos los paquetes instalados y listos para funcionar.

Antes de poder iniciar el servidor, debemos inicializar la base de datos. Para ello copiaremos los contenidos del archivo sql/init.sql y procederemos a ejecutarlo en nuestra instancia de MySQL/MariaDB.

Una vez hecho eso, podremos ejecutar nuestro servidor con normalidad con el comando:

> bun src/index.ts