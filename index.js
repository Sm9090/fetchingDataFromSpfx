console.log("Hello from jsCdn and fetching user detail");

async function getRequestDigest(webUrl) {
  try {
    const response = await fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose"
      }
    });
    if (!response.ok) {
      throw new Error("Failed to get request digest: " + response.statusText);
    }
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  } catch (error) {
    console.error("Error getting request digest:", error);
    throw error;
  }
}

async function createOrUpdateListAndAddItem(webUrl, listName) {
  try {
    const requestDigestValue = await getRequestDigest(webUrl);
    const userResponse = await fetch(`${webUrl}/_api/web/currentUser`, {
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      credentials: "same-origin"
    });

    if (!userResponse.ok) {
      throw new Error("Error fetching user details: " + userResponse.statusText);
    }

    const userData = await userResponse.json();
    const user = userData.d;

    console.log(user, 'User details fetched');

    let response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')`, {
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      credentials: "same-origin"
    });

    console.log(webUrl ," weburl")
    if (response.status === 404) {
      console.log("List not found, creating it...");

      response = await fetch(`${webUrl}/_api/web/lists`, {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json",
          "X-RequestDigest": requestDigestValue
        },
        body: JSON.stringify({
          'Title': listName,
          'BaseTemplate': 100 
        }),
        credentials: "same-origin"
      });

      if (!response.ok) {
        throw new Error("Error creating list: " + response.statusText);
      }
      console.log(response , "response")

      console.log("List created successfully.");
      const columns = [
        { Title: 'Email', FieldTypeKind: 2 },    
        { Title: 'UserID', FieldTypeKind: 2 },    
        { Title: 'Username', FieldTypeKind: 2 }, 
        { Title: 'AddedOn', FieldTypeKind: 4 }  
      ];
      for (const column of columns) {
        const columnResponse = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/Fields`, {
          method: "POST",
          headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json",
            "X-RequestDigest": requestDigestValue
          },
          body: JSON.stringify(column),
          credentials: "same-origin"
        });
      
        const columnResult = await columnResponse.json();
        console.log(`Column ${column} creation response:`, columnResult);
      
        if (!columnResponse.ok) {
          console.error(`Failed to create column ${column}:`, columnResult.error.message);
        }
      }
      console.log("Columns created successfully.");
    } else {
      console.log("List exists.");
    }

    const addItemResponse = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json",
        "X-RequestDigest": requestDigestValue
      },
      body: JSON.stringify({
        'Title': user.Title,
        'Email': user.Email,
        'UserID': user.Id.toString(),
        'Username': user.LoginName,
        'AddedOn': new Date().toISOString()
      }),
      credentials: "same-origin"
    });

    if (!addItemResponse.ok) {
      throw new Error("Error adding item: " + addItemResponse.statusText);
    }

    console.log("User detail added successfully.");
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

window.createOrUpdateListAndAddItem = createOrUpdateListAndAddItem;
