# Usando Node.js
FROM node:20-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências dentro do contêiner
RUN npm install

# Copia o restante do código do projeto
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
