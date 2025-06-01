// import { useState } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Alert,
//   Paper,
//   MenuItem,
//   Grid,
//   FormControl,
//   InputLabel,
//   Select,
//   Chip,
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';



// const CreateElection = () => {
//   const [formData, setFormData] = useState<ElectionFormData>({
//     title: '',
//     description: '',
//     startDate: null,
//     endDate: null,
//     electionType: '',
//     constituencies: [],
//   });
//   const [constituencyInput, setConstituencyInput] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddConstituency = () => {
//     if (constituencyInput && !formData.constituencies.includes(constituencyInput)) {
//       setFormData(prev => ({
//         ...prev,
//         constituencies: [...prev.constituencies, constituencyInput]
//       }));
//       setConstituencyInput('');
//     }
//   };

//   const handleDeleteConstituency = (constituencyToDelete) => {
//     setFormData(prev => ({
//       ...prev,
//       constituencies: prev.constituencies.filter(item => item !== constituencyToDelete)
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!formData.title) {
//       setError('Title is required');
//       return;
//     }

//     if (!formData.startDate || !formData.endDate) {
//       setError('Start date and end date are required');
//       return;
//     }

//     if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
//       setError('End date must be after start date');
//       return;
//     }

//     if (!formData.electionType) {
//       setError('Election type is required');
//       return;
//     }

//     // API call would go here
//     console.log('Election data:', formData);
//     setSuccess('Election created successfully');
//     setFormData({
//       title: '',
//       description: '',
//       startDate: null,
//       endDate: null,
//       electionType: '',
//       constituencies: [],
//     });
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h4" gutterBottom>
//           Create New Election
//         </Typography>
//         <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//           {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
//           <form onSubmit={handleSubmit}>
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Election Title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   multiline
//                   rows={3}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <DatePicker
//                   label="Start Date"
//                   value={formData.startDate}
//                   onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
//                   renderInput={(params) => <TextField {...params} fullWidth required />}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <DatePicker
//                   label="End Date"
//                   value={formData.endDate}
//                   onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
//                   renderInput={(params) => <TextField {...params} fullWidth required />}
//                   minDate={formData.startDate}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <FormControl fullWidth>
//                   <InputLabel>Election Type *</InputLabel>
//                   <Select
//                     name="electionType"
//                     value={formData.electionType}
//                     onChange={handleChange}
//                     label="Election Type *"
//                     required
//                   >
//                     <MenuItem value="national">National</MenuItem>
//                     <MenuItem value="state">State</MenuItem>
//                     <MenuItem value="local">Local</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <TextField
//                     fullWidth
//                     label="Add Constituency"
//                     value={constituencyInput}
//                     onChange={(e) => setConstituencyInput(e.target.value)}
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter') {
//                         e.preventDefault();
//                         handleAddConstituency();
//                       }
//                     }}
//                   />
//                   <Button 
//                     variant="outlined" 
//                     onClick={handleAddConstituency}
//                     disabled={!constituencyInput}
//                   >
//                     Add
//                   </Button>
//                 </Box>
//                 <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                   {formData.constituencies.map((item) => (
//                     <Chip
//                       key={item}
//                       label={item}
//                       onDelete={() => handleDeleteConstituency(item)}
//                     />
//                   ))}
//                 </Box>
//               </Grid>
//               <Grid item xs={12}>
//                 <Button 
//                   type="submit" 
//                   variant="contained" 
//                   color="primary" 
//                   fullWidth
//                   size="large"
//                 >
//                   Create Election
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//         </Paper>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default CreateElection;