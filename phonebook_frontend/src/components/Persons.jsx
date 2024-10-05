const Persons = ({ numbersToShow, deleteFunction }) => {
  return (
    <>
      {numbersToShow.map((person) => (
        <div key={person.name}>
          {person.name} {person.number}{' '}
          <button onClick={() => deleteFunction(person.id)}>Delete</button>
        </div>
      ))}
    </>
  );
};

export default Persons;
