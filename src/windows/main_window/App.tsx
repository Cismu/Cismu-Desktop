import * as ReactDOM from "react-dom/client";

function App() {
  return (
    <>
      <h1 className="text-red-400">¡Bienvenido a Cismu Player! ¿Estás listo para sumergirte en una experiencia musical única?</h1>
      <p className="red">
        ¡Qué emocionante tenerte aquí! Para empezar, hagamos que Cismu refleje tus preferencias. ¿Te gustaría
        ajustar las configuraciones ahora?
      </p>
      <br />
      <div>
        <select name="themes">
          <option value="dark">Oscuro</option>
          <option value="light">Claro</option>
        </select>

        <div>
          <h4>Donde estan tus musicas</h4>
          <input type="file" id="songs" multiple accept=".mp3,.wav" required />

          <ul>
            <li>C:\Users\gmaizo\Downloads</li>
            <li>C:\Users\gmaizo\Music</li>
          </ul>
        </div>
        <br />
        <div>
          <span>0</span>
          <input type="range" min="0" max="120" />
          <span>120</span>
          <label htmlFor="">tiempo en segundos minimo para ignorar archivos</label>
        </div>
        <br />
        <ul>
          <li>mp3</li>
          <li>flac</li>
          <li>aac</li>
          <li>wav</li>
        </ul>
        <br />
        <select name="themes">
          <option value="es-LA">Español Latino America (Latin America Spanish)</option>
          <option value="es-LA">Inglés (English)</option>
        </select>
        <br />
        <h4>Formato de audio preferido</h4>
        <select name="themes">
          <option value="flac">FLAC</option>
          <option value="opus">OPUS</option>
        </select>
        <br />
        <div>
          <label htmlFor="Crossfade">Crossfade</label>
          <input type="checkbox" id="Crossfade" />
        </div>

        <div>
          <label htmlFor="AutoPlay">AutoPlay</label>
          <input type="checkbox" id="AutoPlay"  />
        </div>

        <div>
          <label htmlFor="Mono">Audio Monno</label>
          <input type="checkbox" id="Mono" />
        </div>

        <div>
          <h4>abrir al iniciar</h4>
          <select name="themes">
            <option value="minimized">MINIMIZADO</option>
            <option value="yes">SI</option>
            <option value="opus">NO</option>
          </select>
          <div>
            <h4>cerrar al presionar el boton X</h4>
            <input type="checkbox" />
          </div>
        </div>

        <h4>Almacenamiento</h4>
        <label htmlFor="a">ubicacion del cache</label>
        <ul>
          <li>APPDATA</li>
        </ul>
        <div>borrar cache al 5GB</div>
        <div>borrar si una musica no se reproduce en x tiempo</div>
      </div>

      <div>notificaciones push</div>
      <input type="checkbox" name="" id="" />

      <h4>reproduccion continua</h4>
      <input type="checkbox" name="" id="" />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
