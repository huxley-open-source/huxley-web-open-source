huxley-web
==========

Projeto web para o The Huxley com a nova interface.


## Configurando o ambiente de desenvolvimento para trabalhar na interface gráfica com Angular.js

#### Instalando o Node.js utilizando o NVM (Node Version Manager)

**Pré-requisitos:**

- Compilador c++. Para o OSX, o XCode vai servir, para o Ubuntu, os *packages* build-essential e libssl-dev vão servir.
- Window não é um SO suportado pelo NVM, mas existem algumas soluções alternativas

``` bash
# 0. Para instalar ou atualizar o NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
# 0. Ou via WGET
# wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash

# 1. Instala a última versão do node via nvm
nvm install node

# 2. Coloca a versão do node para ser utilizada como padrão no shell
nvm alias default node
```


**Referências:**

- [NVM](https://github.com/creationix/nvm)
- [NVM-Windows](https://github.com/coreybutler/nvm-windows)


### Instalando o Bower

``` bash
    npm install -g bower
```

### Instalando o Grunt

``` bash
    npm install -g grunt-cli
```

### Instalando o Protractor

``` bash
    npm install -g protractor
```

### Instalando as dependências para a interface gráfica

``` bash
    cd huxley-app/
    bower install
```

### Instalando o Chrome Web Driver

Depois de instalar o Protractor pelo NPM.

``` bash
    cd huxley-app
    webdriver-manager --out_dir vendor/selenium update
```

### Realizando a build do projeto com o Grunt

``` bash
    cd huxley-app/
	npm install
    grunt
```

### Grunt no modo watch, para desenvolvimento

Quando o grunt watch estiver rodando, ele irá monitorar os arquivos do projeto e realizar builds conforme o necessário.

``` bash
    cd huxley-app/
    grunt watch
```

## Grunt

### Rodando os testes com o grunt

Testes e2e e unit:

``` bash
    grunt test
```

Testes e2e com Protractor:

``` bash
    grunt proractor
```


Testes de unidade com Karma:

``` bash
    grunt karma
```

## Intellij IDEA

### Instalando o plugin do Node.JS

1. Para instalar o plugin vá em File > Settings
2. Digite "Plugins" na busca do lado esquerdo da janela de settings e escolha plugins
3. Clique no botão Browse repositories... e digite "NodeJS".
4. Escolha NodeJS e clique no botão verde "Install plugin"

Reinicie o idea e pronto


### Rodando o Grunt do Intellij IDEA

1. No diretório huxley-app/ clique com o botão direito no arquivo Gruntfile.js
2. Escolha: Open Grunt Console
3. Escolha a Task ou Alias para rodar.
