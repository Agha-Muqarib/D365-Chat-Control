import {
  DEFAULT_COMPONENT_ICONS,
  FluentThemeProvider,
} from "@azure/communication-react";
import { Stack, registerIcons, initializeIcons } from "@fluentui/react";
import React from "react";
import ChatBox from "./screens/ChatBox";
import {
  IPublicClientApplication,
  PublicClientApplication,
} from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  MsalProvider,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { Button } from "reactstrap";
import { ChatComponents } from "./screens/ChatComponents";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// If you don't want to provide custom icons, you can register the default ones included with the library.
// This will ensure that all the icons are rendered correctly.
initializeIcons();
registerIcons({ icons: DEFAULT_COMPONENT_ICONS });

interface AppProps {
  instance: PublicClientApplication;
}

const MainContent = () => {
  /**
   * useMsal is hook that returns the PublicClientApplication instance,
   * that tells you what msal is currently doing. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
   */
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const handleRedirect = () => {
    instance
      .loginPopup({
        ...loginRequest,
        prompt: "create",
      })
      .catch((error) => console.log(error));
  };

  const stackStyle = {
    root: {
      width: "100%",
    },
  };

  return (
    <div className="App">
      <AuthenticatedTemplate>
        {activeAccount ? (
          <FluentThemeProvider>
            {/* <Router>
                <Switch>
                  <Route component={ChatBox} />
                  <Route
                    path="/detail/:chatThreadId"
                    component={ChatComponents}
                  />
                </Switch>
              </Router> */}
            <ChatBox />
          </FluentThemeProvider>
        ) : null}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button
          className="signInButton"
          onClick={handleRedirect}
          variant="primary"
        >
          Sign In
        </Button>
      </UnauthenticatedTemplate>
    </div>
  );
};

function App({ instance }: AppProps): JSX.Element {
  const stackStyle = {
    root: {
      width: "100%",
    },
  };

  console.log("before return");
  return (
    <MsalProvider instance={instance}>
      <MainContent />
    </MsalProvider>
  );
}

export default App;
