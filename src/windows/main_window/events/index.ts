import Config from "../../../main/modules/Config";

window.api.on("cismu:renderer:get->config", (event, config: Config) => {
  localStorage.setItem("config", JSON.stringify(config));
});

window.api.on("cismu:renderer:find->songs", (event, songs: any) => {
  console.log(songs)
});

