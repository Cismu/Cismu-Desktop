import * as ReactDOM from "react-dom/client";

function App() {
  return (
    <div>
      <h1 className="text-red-400">
        ¡Bienvenido a Cismu Player! ¿Estás listo para sumergirte en una experiencia musical única?
      </h1>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
