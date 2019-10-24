# COMANDA - the human tetris

**Comanda** è un interfaccia di controllo che sfrutta i movimenti e i suoni dell'utente per controllare una partita di **Tetris**.

**Comanda** si ispira alla [**Teachable Machine**](https://teachablemachine.withgoogle.com/) di Google con l'idea di "istruire" il computer a riconoscere movimenti e suoni per poi convertirli in comandi per giocare a **Tetris**.

**Comanda** è composto da 2 controller che utilizzano lo stesso algoritmo di [**KNN classification**](https://www.youtube.com/watch?v=KTNqXwkLuM4&t=784s) con 2 differenti **feature extractors**:
- [**MobileNet**](https://ai.googleblog.com/2017/06/mobilenets-open-source-models-for.html): un modello di **Convolutional Neural Network** per fare image classification
- [**Meyda**](https://meyda.js.org/): un audio feature extractor che analizza lo stream audio sfruttando le **Web audio API**

Il primo controller serve per registrare i movimenti tramite **webcam**, il secondo per registrare suoni tramite **interfaccia audio/microfono**. I due controller sono configurati per poter registrare e salvare il proprio set di comandi e caricarlo all'inizio di una nuova partita.

I Controller comunicano con la webapp di **Tetris** tramite web socket ([**socket.io**](https://socket.io/docs/)) in modo da poter comunicare in **real time** i comandi rilevati.

Il gioco di **Tetris** è stato leggermente modificato per funzionare con i comandi registrati dall'utente:
- L'utente deve imitare la posa del pezzo che appare a schermo
- Se l'utente non imita il pezzo correttamente il gioco viene messo in pausa e allo scadere di un timer va in game over
- Per mouvere o ruotare i pezzi del tetris vengono utilizzati i comandi vocali

___

## How to run

**Comanda** è composto da 3 web applications (2 controller + Tetris) e 1 middleware (socket server), il tutto scritto in javascript/nodejs.

### Requirements
- [**Nodejs**](https://nodejs.org/en/)
- **Web server**: [http-server](https://www.npmjs.com/package/http-server), [browser-sync](https://www.browsersync.io/), ...

### Installation

Per iniziare occorre scaricare il repo:

```
git clone git@github.com:todotoit/WS-ML-COMANDA.git
cd WS-ML-COMANDA
```

E installare le dependencies per il **Middleware**

```
cd Middleware
npm i
```

### Run

#### Middleware
Il Middleware lancia il web socket server sulla porta **3004**
```
cd Middleware
npm start
```
```
> ws-ml-comanda@1.0.0 start C:\Users\maimo\Code\Exercises\ML\WS-ML-COMANDA\Middleware
> node server.js

listening on *:3004
```

#### Video controller
Lanciare il web server (su una porta diversa da **3004**)
```
http-server KNNClassification_TeachableMachine/ -p 3000
```
```
Starting up http-server, serving KNNClassification_TeachableMachine/
Available on:
  http://192.168.242.1:3000
  http://169.254.33.194:3000
  http://192.168.33.1:3000
  http://192.168.1.116:3000
  http://127.0.0.1:3000
Hit CTRL-C to stop the server
```

#### Audio controller
Lanciare il web server (su una porta diversa da **3004**)
```
http-server KNNClassification_Meyda/ -p 3002
```
```
Starting up http-server, serving KNNClassification_Meyda/
Available on:
  http://192.168.242.1:3002
  http://169.254.33.194:3002
  http://192.168.33.1:3002
  http://192.168.1.116:3002
  http://127.0.0.1:3002
Hit CTRL-C to stop the server
```

#### Tetris
Lanciare il web server (su una porta diversa da **3004**)
```
http-server Tetris/ -p 3006
```
```
Starting up http-server, serving Tetris/
Available on:
  http://192.168.242.1:3006
  http://169.254.33.194:3006
  http://192.168.33.1:3006
  http://192.168.1.116:3006
  http://127.0.0.1:3006
Hit CTRL-C to stop the server
```

### Play

Dalla web app dei controller si può caricare un dataset esistente oppure registrarne uno nuovo.

I dataset vengono salvati come **trained.json** nella cartella di download del browser, per caricare un nuovo dataset sostituire il file **trained.json** nella root del controller e cliccare su **Load dataset**.

Per cominciare a tracciare i movimenti/suoni fare clic su **Start predicting!**
Il controller comincerà a tracciare i movimenti e mandare messaggi al middleware con i comandi rilevati.

Per cominciare a giocare basta aprire la pagina di Tetris e iniziare una nuova partita.

___

## Have Fun!
![tetris](https://techcrunch.com/wp-content/uploads/2013/01/tetrislogo_4cprocess_r.gif)