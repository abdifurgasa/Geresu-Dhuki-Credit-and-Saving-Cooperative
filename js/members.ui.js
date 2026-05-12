export function renderMembers(table, members) {

  table.innerHTML = "";

  members.forEach(m => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${m.nid}</td>
      <td>${m.savings || 0} ETB</td>
      <td>${m.status || "Active"}</td>
      <td>
        <button data-edit="${m.id}">Edit</button>
        <button data-del="${m.id}">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}
