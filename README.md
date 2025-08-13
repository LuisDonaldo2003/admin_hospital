# Proyecto SISMEG

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://github.com/LuisDonaldo2003/admin_hospital/blob/main/src/assets/img/login-logo.png" width="400" alt="Laravel Logo"></a></p>

Este proyecto fue desarrollado por estudiantes del Instituto Tecnológico de Ciudad Altamirano, Guerrero, durante su estancia en el Hospital IMSS-Bienestar Coyuca de Catalán “Dr. Guillermo Soberón Acevedo”, con el propósito de ser implementado en el ámbito hospitalario, conforme a los requerimientos establecidos por el Director General, Eric Aburto Álvarez, en el marco del programa de Educación Dual.
## Estudiantes a cargo del proyecto

- Luis Donaldo López Martínez (Full Stack Developer & UI/UX Designer)
- Alejandro Vidal Pérez (Software Developer)
- Enrique Ruiz Peralta (Software Developer & Product Strategist.)
- Julián Reynoso Zavaleta (Product Strategist & Theoretical Concept Developer)
- Jose Antonio Herrera Chamu  (Product Strategist & Theoretical Concept Developer)

# Requisitos previos para la construcción

- Tener instalado [Node.js](https://nodejs.org/es/download "Node.js"), es un entorno de ejecución de JavaScript que permite ejecutar código JavaScript fuera del navegador, es decir, directamente en el sistema operativo., si en dado caso quieres un gestor de versiones para `Node.js`, puedes usar `Nvm`,
- Tener instalado en el sistema `npm`

Dichos requisitos podrás ver como se instala y configura en [este video tutorial](https://youtu.be/Z-Ofqd2yBCc "este video tutorial")

# Pasos para clonar el repositorio

- Crea una carpeta donde vaya a clonar dicho repositorio
- Ejecuta un cmd en dirección a la carpeta de destino
- Inicializar `git init` para que el destino sea apto para la clonación
- Ejecutar `git clone https://github.com/LuisDonaldo2003/admin_hospital.git` 

# Pasos para construir Angular

## 1. Configuración del archivo `php.ini`

Ejecuta el siguiente comando

```javascript
npm install
```
Se utiliza en proyectos que usan Node.js para instalar todas las dependencias que el proyecto necesita, según lo indicado en el archivo `package.json`

## 2. Dirígete a `proxy.conf.json`

El archivo proxy.conf.json se usa en proyectos Angular para redirigir solicitudes HTTP desde el frontend al backend durante el desarrollo, evitando problemas de CORS y haciendo que las URLs sean más limpias y consistentes.

En dicho archivo modificarás el contenido con lo siguiente

```javascript
{
  "/api": {
    "target": "http://127.0.0.1:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 3. Modificación al archivo `enviroments`

Dirígete a la siguiente dirección `admin_clinica\src\environments`, al archivo `environment.development.ts`, con la finalidad de modificar su contenido con lo siguiente:

```javascript
export const environment = {
  URL_BACKEND: 'http://127.0.0.1:8000',
  URL_SERVICIOS: 'http://127.0.0.1:8000/api',
  URL_FRONTED: 'http://localhost:4200/'
};
```

La razón del cambio en estas circunstancias, es porque nos encontramos trabajando bajo a un dominio genérico para el desarrollo del proyecto

## 4. Inicializar el proyecto

Para inicializar el proyecto, abre un cmd o donde tengas abierto dicha parte del proyecto y ejecuta

```javascript
npm start
```