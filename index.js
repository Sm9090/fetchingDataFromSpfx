console.log("Hello from jsCdn and fetching user detail");

async function createOrUpdateListAndAddItem(webUrl, listName, spHttpClient) {
  try {
    // Step 1: Fetch current user details
    const userResponse = await spHttpClient.get(`${webUrl}/_api/web/currentUser`, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        // 'Content-Type': 'application/json'

      }
    });

    if (!userResponse.ok) {
      throw new Error("Error fetching user details: " + userResponse.statusText);
    }

    const userData = await userResponse.text();
    const user = userData.d;

    console.log(user, 'user');

    // Step 2: Check if the list exists
    let response = await spHttpClient.get(`${webUrl}/_api/web/lists/getbytitle('${listName}')`, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        // 'Content-Type': 'application/json'
      }
    });

    // If the list doesn't exist, create it
    if (response.status === 404) {
      console.log("List not found, creating it...");

      response = await spHttpClient.post(`${webUrl}/_api/web/lists`, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json'
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

      // Step 3: Create columns in the list
      const columns = ['Email', 'UserID', 'Username', 'AddedOn'];
      for (const column of columns) {
        await spHttpClient.post(`${webUrl}/_api/web/lists/getbytitle('${listName}')/Fields`, {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json'
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
    const addItemResponse = await spHttpClient.post(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.UserListItem' },
        'Title': user.Title,
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
    console.error("Something went wrong:", error);
  }
}

window.createOrUpdateListAndAddItem = createOrUpdateListAndAddItem;  
