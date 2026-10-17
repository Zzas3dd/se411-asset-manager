
const team = [
  { name: "Zaina Alasaad", id: "223410087" },
  { name: "Mariam Koubaa", id: "223410241" },
  { name: "Deem Alhaqbani", id: "223410331" },
];

function About() {
  return (
    <div>
      <h1>About</h1>
      <p>
        This app helps a company manage its computers. You can add, view,
        edit and delete assets. SE411 Project Part 1.
      </p>

      <h2>Team Members</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
          </tr>
        </thead>
        <tbody>
          {team.map((member) => (
            <tr key={member.name}>
              <td>{member.name}</td>
              <td>{member.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default About;
