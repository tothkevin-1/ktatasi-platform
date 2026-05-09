import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '@mui/material/styles';
const JegyEloszlasDiagram = ({ data }) => {
const theme = useTheme();
return (
<ResponsiveContainer width="100%" height={300}>
<BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name"><Label value="Érdemjegyek" offset={-15} position="insideBottom" /></XAxis>
<YAxis allowDecimals={false}><Label value="Darabszám" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} /></YAxis>
<Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}/>
<Legend verticalAlign="top" />
<Bar dataKey="darab" fill={theme.palette.primary.main} name="Beadások száma" />
</BarChart>
</ResponsiveContainer>
);
};
export default JegyEloszlasDiagram;