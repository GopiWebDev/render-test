import { useState, useEffect } from 'react';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import services from './services/services';
import Notification from './components/Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [addMessage, setAddMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    services.getAll().then((persons) => setPersons(persons));
  }, []);

  const numbersToShow = persons.filter((person) => {
    return person.name.toLowerCase().includes(filter.toLowerCase());
  });

  const handleFilter = (e) => {
    e.preventDefault();
    setFilter(e.target.value);
  };

  const handleNameChange = (e) => {
    e.preventDefault();
    setNewName(e.target.value);
  };

  const handleNumberChange = (e) => {
    e.preventDefault();
    setNewNumber(e.target.value);
  };

  const addNumber = (e) => {
    e.preventDefault();

    const doesNameExits = persons.some((person) => person.name === newName);

    if (!doesNameExits) {
      const newObject = {
        name: newName,
        number: newNumber,
        id: String(persons.length + 1),
      };

      services
        .create(newObject)
        .then((response) => {
          persons.push(response);
          setPersons(persons);
          setNewName('');
          setNewNumber('');
        })
        .then(() => {
          setAddMessage(`Added ${newObject.name}`);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.error);
        });

      setTimeout(() => {
        setAddMessage(null);
        setErrorMessage(null);
      }, 5000);
    } else {
      const person = persons.find((person) => person.name === newName);
      const choice = window.confirm(
        `${person.name} is already in the phonebook, replace the old number with a new one ?`
      );

      if (choice) {
        const newObject = { ...person, number: newNumber };

        services
          .updatePerson(person.id, newObject)
          .then((response) => {
            setPersons(persons.map((p) => (p.id !== person.id ? p : response)));
          })
          .catch(() => {
            setErrorMessage(
              `Information of ${newObject.name} has been already removed from the server`
            );
          });

        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      } else {
        return;
      }
    }
  };

  const deletePerson = (id) => {
    const person = persons.find((p) => p.id === id);
    const choice = window.confirm(`Delete ${person.name} ?`);

    if (choice) {
      services.deletePerson(id).then((response) => {
        const newPersons = persons.filter(
          (person) => person.id !== response.id
        );
        setPersons(newPersons);
      });
    } else {
      return;
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={addMessage} error={false} />
      <Notification message={errorMessage} error={true} />
      <Filter filter={filter} handleFilter={handleFilter} />
      <h3>Add a new</h3>
      <PersonForm
        addNumber={addNumber}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons numbersToShow={numbersToShow} deleteFunction={deletePerson} />
    </div>
  );
};

export default App;

