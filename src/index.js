import React from "react";
import ReactDOM from "react-dom";
import immer from "immer";
import "./styles.css";

const cachedState = localStorage.getItem("AppState");

const initialState = cachedState
  ? JSON.parse(cachedState)
  : {
      users: [],
      canEdit: true
    };

const storeContext = React.createContext();

const actions = {
  addUser: state => {
    state.users.push("");
  },
  toggleCanEdit: state => {
    state.canEdit = !state.canEdit;
  },
  updateUserName: (state, index, value) => {
    state.users[index] = value;
  }
};
function StoreProvider({ children }) {
  const [state, setState] = React.useState(initialState);
  const immerActions = {};
  Object.keys(actions).forEach(key => {
    immerActions[key] = (...args) =>
      setState(old => {
        const newState = immer(old, draft => actions[key](draft, ...args));
        localStorage.setItem("AppState", JSON.stringify(newState));
        return newState;
      });
  });

  const contextValue = React.useMemo(() => [state, immerActions], [state]);
  return (
    <storeContext.Provider value={contextValue}>
      {children}
    </storeContext.Provider>
  );
}

function UserCount() {
  const [{ users }, { addUser }] = React.useContext(storeContext);
  const count = users.length;

  return (
    <div>
      <div>Users: {count}</div>
      <div>
        <button onClick={() => addUser()}>Add User</button>
      </div>
    </div>
  );
}

function CanEdit() {
  const [{ canEdit }, { toggleCanEdit }] = React.useContext(storeContext);

  return (
    <div>
      <div>Can Edit: {canEdit.toString()}</div>
      <div>
        <button onClick={() => toggleCanEdit()}>Toggle can edit</button>
      </div>
    </div>
  );
}

function Users() {
  const [{ users, canEdit }, { updateUserName }] = React.useContext(
    storeContext
  );

  return (
    <div>
      Users:
      {users.length ? (
        <div>
          {users.map((user, idx) => (
            <div key={idx}>
              <input
                key={idx}
                value={user}
                onChange={e => {
                  updateUserName(idx, e.target.value);
                }}
                disabled={!canEdit}
              />
            </div>
          ))}
        </div>
      ) : (
        <div>No users</div>
      )}
    </div>
  );
}

function Debug() {
  const [state, setState] = React.useContext(storeContext);
  return (
    <pre>
      <code>{JSON.stringify(state, null, 2)}</code>
    </pre>
  );
}

function App() {
  return (
    <StoreProvider>
      <div className="App">
        <UserCount />
        <br />
        <CanEdit />
        <br />
        <Users />
        <br />
        <Debug />
        <br />
      </div>
    </StoreProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
