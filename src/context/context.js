import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollower] = useState(mockFollowers);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(0);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchUser = async (user) => {
    toggleError(false, "");
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );
    console.log(response);
    if (response) {
      setGithubUser(response.data);
      const { followers_url, login } = response.data;
      axios(`${rootUrl}/users/${login}/repos?per_page=100`).then((response) =>
        setRepos(response.data)
      );
      axios(`${followers_url}?per_page=100`).then((response) =>
        setFollower(response.data)
      );
    } else {
      toggleError(true, "No match to this username");
    }
    checkRequest();
    setLoading(false);
  };

  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        console.log(data);
        setRequests(remaining);
        if (remaining === 0) {
          toggleError(true, "sry now requests for you");
        }
      })
      .catch((err) => console.log(err));
  };
  function toggleError(show, msg) {
    setError({ show, msg });
  }

  useEffect(() => {
    checkRequest();
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchUser,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};
// export const useGlobalContext = () => {
//   return useContext(AppContext);
// };
export { GithubContext, GithubProvider };
