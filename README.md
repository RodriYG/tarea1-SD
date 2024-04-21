# Tarea 1 - Sistemas Distribuidos
Instalar modulos en la carperta "cache-*" con el sistema de chache a probar:
```sh
npm install
```

Iniciar docker compose en la version de sistema de cache a probar.
```sh
docker-compose up
```

Para iniciar el cliente y servidor usar el comando:
```sh
npm start
```

El cliente esta alojado en la dirección:
```sh
http://0.0.0.0:3000
```

Para usar el metodo GET se tienen las direcciones:
```sh
http://0.0.0.0:3000/airports
http://0.0.0.0:3000/airports/code
```

La primera para obtener todos los datos, y la segunda para obtener un dato en especifico.
