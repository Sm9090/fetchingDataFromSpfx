console.log("Hello from jsCdn and fetching user detail");

async function createOrUpdateListAndAddItem(webUrl, listName) {
  try {
    // Step 1: Fetch current user details
    const userResponse = await fetch(`${webUrl}/_api/web/currentUser`, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Error fetching user details: " + userResponse.statusText);
    }

    const userData = await userResponse.json();
    const user = userData.d;

    console.log(user, 'user');

    // Step 2: Check if the list exists
    let response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json;odata=verbose'
      }
    });

    // If the list doesn't exist, create it
    if (!response.ok && response.status === 404) {
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

      console.log(response , 'response')

      console.log("List created successfully.");

      // Step 3: Create columns in the list
      const columns = ['Email', 'UserID', 'Username', 'AddedOn'];
      for (const column of columns) {
        await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/Fields`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json',
            'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
          },
          body: JSON.stringify({
            '__metadata': { 'type': 'SP.Field' },
            'Title': column,
            'FieldTypeKind': 2, // Single line of text
            'Required': false
          })
        });
      }
      console.log("Columns created successfully.");
    } else {
      console.log("List exists.");
    }

    // Step 4: Add an item with user details
    const addItemResponse = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json',
        'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
      },
      body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.UserListItem' },
        'Title': user.Title, // Using the user name as the Title
        'Email': user.Email,
        'UserID': user.Id,
        'Username': user.LoginName,
        'AddedOn': new Date().toISOString()
      })
    });

    if (!addItemResponse.ok) {
      throw new Error("Error adding item: " + addItemResponse.statusText);
    }

    console.log("User detail added successfully.");
  } catch (error) {
    console.error("Error:", error);
  }
}

window.createOrUpdateListAndAddItem = createOrUpdateListAndAddItem;
