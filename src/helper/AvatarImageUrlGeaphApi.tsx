async function GetAvatarUrl(userId: string, accesstokenarg: string) {
  try {
    console.log("GetAvatarUrl userId --> ", userId);
    console.log("GetAvatarUrl accesstokenarg --> ", accesstokenarg);
    const endpoint = `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accesstokenarg,
      },
    });

    if (!response.ok) {
        return "";
    //   throw new Error(
    //     `GetAvatarUrl: Network response was not ok. Status: ${response.status}`
    //   );
    }

    console.log("GetAvatarUrl response --> ", response);
    console.log("GetAvatarUrl response.url --> ", response.url);
    return response.url;
  } catch (error) {
    console.log("GetAvatarUrl Autherror: ", error);
  }
}

export default GetAvatarUrl;
