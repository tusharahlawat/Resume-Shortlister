import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function App() {
  const [files, setFiles] = useState([]);
  const [jobRole, setJobRole] = useState('');
  const [skills, setSkills] = useState('');
  const [currentSkills, setCurrentSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: acceptedFiles => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }
  });

  const handleAddSkill = () => {
    if (skills.trim() !== '' && !currentSkills.includes(skills.trim())) {
      setCurrentSkills([...currentSkills, skills.trim()]);
      setSkills('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('resumes', file);
      });
      formData.append('jobRole', jobRole);
      formData.append('skills', JSON.stringify(currentSkills));

      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resumes. Please try again.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Resume Shortlister
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Job Role"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          margin="normal"
        />

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Required Skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleAddSkill}
            sx={{ mt: 1 }}
          >
            Add Skill
          </Button>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {currentSkills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              onDelete={() => handleRemoveSkill(skill)}
            />
          ))}
        </Stack>
      </Box>

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f5f5f5',
          border: '2px dashed #9e9e9e',
          '&:hover': {
            backgroundColor: '#eeeeee'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: '#757575', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag and drop resumes here
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to select files (PDF, DOC, DOCX)
        </Typography>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files:
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={files.length === 0 || !jobRole || currentSkills.length === 0 || loading}
        sx={{ mt: 3 }}
      >
        Analyze Resumes
      </Button>

      {loading && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography>Analyzing resumes...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      {results && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results:
          </Typography>
          <List>
            {results.map((result, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={result.fileName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Match Score: {result.matchScore}%
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Matching Skills: {result.matchingSkills.join(', ')}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
}

export default App;