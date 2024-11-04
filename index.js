console.log("Hello form jsCdn and fetching user detail")
async function createOrUpdateListAndAddItem(webUrl, listName) {
  try {
    const userResponse = await fetch(`${webUrl}/_api/web/currentUser`, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    });
    const userData = await userResponse.json();
    const user = userData.d;

    console.log(user , 'user')


    let response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json;odata=verbose'
      }
    });

    if (!response.ok && response.status === 404) {
      // If list doesn't exist, create it
      console.log("List not found, creating it...");

      response = await fetch(`${webUrl}/_api/web/lists`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json',
          'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
        },
        body: JSON.stringify({
          '__metadata': { 'type': 'SP.List' },
          'Title': listName,
          'BaseTemplate': 100 // Custom list type
        })
      });

      if (!response.ok) {
        throw new Error("Error creating list: " + response.statusText);
      }

      console.log("List created successfully.");
    } else {
      console.log("List exists.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

window.createOrUpdateListAndAddItem = createOrUpdateListAndAddItem;