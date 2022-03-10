import { useState } from 'react'
import Select from 'react-select'
import './Create.css'
import { useCollection } from './../../hooks/useCollection';
import { useEffect } from 'react';
import { timestamp } from '../../firebase/config';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useFirestore } from './../../hooks/useFirestore';
import { useHistory } from 'react-router-dom';


const categories = [
  {value: 'development', label: 'Development'},
  {value: 'design', label: 'Design'},
  {value: 'sales', label: 'Sales'},
  {value: 'marketing', label: 'Marketing'}
]

export default function Create() {
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [assignedUsers, setAssignedUsers] = useState([])
  const {documents, error} = useCollection('users')
  const [users, setUsers] = useState([])
  const [formError, setFormError] = useState(null)
  const {user} = useAuthContext()
  const {addDocument, response} = useFirestore('projects')
  const history = useHistory()
  useEffect(() => {
    if(documents){
      const options = documents.map(user => {
        return {value: user, label: user.displayName}
      })
      setUsers(options)
    }
  }, [documents])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if(!category){
      setFormError('please select category')
      return
    }
    if(assignedUsers.length < 1){
      setFormError('please assign the project to at least 1 user')
      return
    }
    const createdBy = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      id: user.uid
    }
    const assignedUsersList = assignedUsers.map((u) => {
      return{
        displayName: u.value.displayName,
        photoURL: u.value.photoURL,
        id: u.value.id
      }
    })
    const project = {
      name,
      details,
      category: category.value,
      dueDate: timestamp.fromDate(new Date(dueDate)),
      comments: [],
      createdBy,
      assignedUsersList
    }
    await addDocument(project)
    if(!response.error){
        history.push('/')
    }
  }

  return (
    <div className='create-form'>
      <h2 className='page-title'>Create a new project</h2>
      <form onSubmit={handleSubmit}>
       <label>
         <span>Project name:</span>
         <input
          type="text"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
         />
       </label>
       <label>
         <span>Project details:</span>
         <textarea
          type="text"
          required
          onChange={(e) => setDetails(e.target.value)}
          value={details}
         />
       </label>
       <label>
         <span>set due date:</span>
         <input
          type="date"
          required
          onChange={(e) => setDueDate(e.target.value)}
          value={dueDate}
         />
       </label>
       <label>
         <span>Project category:</span>
         <Select
         onChange={(option) => setCategory(option)}
         options={categories}
         />
       </label>
       <label>
         <span>Assign to:</span>
         <Select
         onChange={(option) => setAssignedUsers(option)}
           options={users}
           isMulti
         />
       </label>
       <button className='btn'>Add Project</button>
       {formError && <p className='error'>{formError}</p>}
      </form>
    </div>
  )
}
