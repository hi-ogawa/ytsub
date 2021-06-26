import React from "react";
import ReactDOM from "react-dom";

import "style-loader!css-loader!sass-loader!./scss/index.scss";
import Root from "./components/Root.js";
import registerServiceWorker from "./registerServiceWorker.js";
import { createProvider } from "./stateDef.js";

const Main = () => {
  registerServiceWorker();
  const Provider = createProvider({ storage: true });
  ReactDOM.render(
    <Provider>
      <Root />
    </Provider>,
    document.getElementById("root")
  );
};

Main();
