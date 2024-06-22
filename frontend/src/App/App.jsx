import { useEffect, useState } from "react";
import Login from "../Authentication/Login";

import MainPage from "../Pages/MainPage";
import ProfilePage from "../Pages/ProfilePage";
import AccountMenu from "../StaticElements/AccountMenu";
import AddPostPage from "../Pages/AddPostPage";
import SettingsPage from "../Pages/SettingsPage";
import SearchBar from "../StaticElements/SearchBar";
import StatusDialog from "../Dialogs/StatusDialog";

import setTheme from "../functions/themeChange";

function App() {
  const [posts, setPosts] = useState(false);

  const [removeOptions, setRemoveOptions] = useState(false);

  const [currentPageView, setCurrentPageView] = useState('home');
  const [postFetchingProgress, setPostFetchingProgress] = useState(false);

  useEffect(() => {
    setTheme();
    localStorage.getItem('accessToken') && onSuccessfulAuth();
  }, []);
  
  function onSuccessfulAuth() {
    setPostFetchingProgress("Updating posts...");
    fetch("http://localhost:5000/posts", {
      headers: {
        'X-Authorization': localStorage.getItem("accessToken"),
      },
    })
      .then((response) => {
        if(!response.ok) throw new Error('Error authenticating user.');
        return response.json();
      })
      .then((response) => {
        setPosts(response);
        setPostFetchingProgress(false);
      })
      .catch((err) => {
        console.error(err);
        localStorage.clear();
        setPostFetchingProgress(false);
      });
  }

  function removeOptionsSelected(event) {
    if (
      !(
        event.target.classList.contains("dropdown") ||
        event.target.closest(".dropdown")
      ) &&
      !event.target.classList.contains("show-options-button")
    ) {
      setRemoveOptions(!removeOptions);
    }
  } // all of this is done to check for option/filter dropdowns opened, could've done it a lot easier with .addEventListener inside of the dropdown itself but I wanted not to use it since I read online that this feature may lead to unpredictable behaviour and generally in React onClick, onChange, etc... should be used

  let currentlyDisplayedPage = (
    <MainPage
      removeOptionsSelected={removeOptionsSelected}
      onSuccesfulAuth={onSuccessfulAuth}
      posts={posts}
      removeOptions={removeOptions}
    />
  );

  if (currentPageView === "profile")
    currentlyDisplayedPage = (
      <ProfilePage
        allPosts={posts}
        redirectToMainPage={() => {
          setCurrentPageView("home");
          onSuccessfulAuth();
        }}
        removeOptionsSelected={removeOptionsSelected}
        onSuccesfulAuth={onSuccessfulAuth}
        removeOptions={removeOptions}
      />
    );
  else if (currentPageView === "addPost")
    currentlyDisplayedPage = (
      <AddPostPage
        redirectToMainPage={() => {
          setCurrentPageView("home");
          onSuccessfulAuth();
        }}
      />
    );
  else if (currentPageView === "settings")
    currentlyDisplayedPage = (
      <SettingsPage pageView={setCurrentPageView} logout={() => setPosts(false)} reloadPosts={onSuccessfulAuth}/>
    );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageView]);

  return (
    <>
      {posts ? (
        <>
          {postFetchingProgress && (
            <StatusDialog>{postFetchingProgress}</StatusDialog>
          )}

          <AccountMenu
            currentPageView={currentPageView}
            pageView={setCurrentPageView}
            logout={() => { setPosts(false); localStorage.clear(); setCurrentPageView('home'); }}
          />
          {(currentPageView === "profile" || currentPageView === "home") && (
            <SearchBar
              posts={posts}
              setPosts={setPosts}
              filterShow={removeOptions}
            ></SearchBar>
          )}
          {currentlyDisplayedPage}
        </>
      ) : (
        localStorage.getItem('accessToken') ? undefined : <Login onAuth={onSuccessfulAuth} />
      )}
    </>
  );
}

export default App;
