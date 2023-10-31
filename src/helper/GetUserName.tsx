async function GetUserName(userid: string, accesstokenarg: string) {
    try {
      const endpoint =
        `https://graph.microsoft.com/v1.0/users/${userid}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accesstokenarg,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(
          `GetUserName: Network response was not ok. Status: ${response.status}`
        );
      }
  
      const responseJson = await response.json();
      console.log("GetUserName response --> ", responseJson);
      return responseJson.displayName;
    } catch (error) {
      console.log("GetUserName Autherror: ", error);
    }
  }
  
  export default GetUserName;
  