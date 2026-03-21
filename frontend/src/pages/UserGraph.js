import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Drawer,
  IconButton,
  Chip,
  Divider,
  Container,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Graph from 'graphology';
import Sigma from 'sigma';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

const PRIORITY_COLORS = {
  'Highest': '#d32f2f',
  'High':    '#f44336',
  'Medium':  '#ff9800',
  'Low':     '#42a5f5',
  'Lowest':  '#90caf9',
};

/*
const PRIORITY_SIZES = {
  'Highest': 24,
  'High':    20,
  'Medium':  16,
  'Low':     12,
  'Lowest':  10,
};
*/

const UserGraph = () => {
  const { accountId } = useParams();
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const dragModeRef = useRef(false);
  const graphDataRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [userName, setUserName] = useState('');

  const [filters, setFilters] = useState({ statuses: [], priorities: [] });
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  useEffect(() => {
    dragModeRef.current = dragMode;
  }, [dragMode]);

  useEffect(() => {
    if (graphDataRef.current) {
      renderGraph(graphDataRef.current, selectedStatuses, selectedPriorities);
    }
  }, [selectedStatuses, selectedPriorities]);

  useEffect(() => {
    if (!accountId) return;

    const fetchGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        const graphRes = await fetch(`http://localhost:5000/api/database/user/${accountId}/graph`);

        if (!graphRes.ok) throw new Error('Nepodarilo sa načítať údaje grafu');

        const data = await graphRes.json();

        if (!data.graph.nodes || data.graph.nodes.length === 0) {
          setError('Pre tohto používateľa sa nenašli žiadne údaje grafu');
          return;
        }

        // Extract unique statuses and priorities from the graph data
        const statuses = [...new Set(
          data.graph.nodes
            .filter(n => n.type === 'issue' && n.data.status)
            .map(n => n.data.status)
        )].sort();

        const priorities = [...new Set(
          data.graph.nodes
            .filter(n => n.type === 'issue' && n.data.priority)
            .map(n => n.data.priority)
        )].sort();

        // Get user display name from the user node
        const userNode = data.graph.nodes.find(n => n.type === 'user');
        if (userNode) setUserName(userNode.label);

        graphDataRef.current = data.graph;
        setFilters({ statuses, priorities });
        setSelectedStatuses(statuses);
        setSelectedPriorities(priorities);

        renderGraph(data.graph, statuses, priorities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
      }
    };
  }, [accountId]);

  const renderGraph = (data, activeStatuses, activePriorities) => {
    if (!containerRef.current) return;

    const graph = new Graph();

    // Add user node first
    data.nodes.forEach(node => {
      if (node.type === 'user') {
        graph.addNode(node.id, {
          label: node.label,
          size: 18,
          color: '#2e7d32',
          nodeType: node.type,
          data: node.data,
        });
      }
    });

    // Add issue nodes filtered by status and priority
    data.nodes.forEach(node => {
      if (node.type === 'issue') {
        const matchesStatus = !activeStatuses || activeStatuses.includes(node.data.status);
        const matchesPriority = !activePriorities || activePriorities.includes(node.data.priority);
        if (matchesStatus && matchesPriority) {
          graph.addNode(node.id, {
            label: node.label,
            size: 15,
            color: PRIORITY_COLORS[node.data.priority] || '#1976d2',
            nodeType: node.type,
            data: node.data,
          });
        }
      }
    });

    // Add edges where both nodes are visible
    data.edges.forEach(edge => {
      try {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
          graph.addEdge(edge.source, edge.target, {
            label: edge.label,
            edgeType: edge.type,
            type: 'arrow',
            size: 6,
            color: '#999',
          });
        }
      } catch (err) {
        // Edge might already exist, skip
      }
    });

    circular.assign(graph);
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { iterations: 50, settings });

    if (sigmaRef.current) sigmaRef.current.kill();

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: true,
      defaultEdgeType: 'arrow',
      labelSize: 12,
      labelWeight: 'bold',
      allowInvalidContainer: true,
    });

    sigmaRef.current = sigma;

    let draggedNode = null;
    let isDragging = false;

    sigma.on('downNode', (e) => {
      if (!dragModeRef.current) return;
      isDragging = true;
      draggedNode = e.node;
      graph.setNodeAttribute(draggedNode, 'highlighted', true);
      if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
    });

    sigma.on('moveBody', ({ event }) => {
      if (!isDragging || !draggedNode || !dragModeRef.current) return;
      const pos = sigma.viewportToGraph(event);
      graph.setNodeAttribute(draggedNode, 'x', pos.x);
      graph.setNodeAttribute(draggedNode, 'y', pos.y);
      event.preventSigmaDefault();
      event.original.preventDefault();
      event.original.stopPropagation();
    });

    const handleUp = () => {
      if (draggedNode) graph.removeNodeAttribute(draggedNode, 'highlighted');
      isDragging = false;
      draggedNode = null;
    };

    sigma.on('upNode', handleUp);
    sigma.on('upStage', handleUp);

    sigma.on('clickNode', ({ node }) => {
      if (dragModeRef.current) return;
      const nodeData = graph.getNodeAttributes(node);
      setSelectedNode({ id: node, ...nodeData });
      setDrawerOpen(true);
    });

    sigma.on('clickStage', () => setDrawerOpen(false));
  };

  const handleCloseDrawer = () => setDrawerOpen(false);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {userName || accountId} - Graf používateľa
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <Box sx={{ position: 'relative', width: '100%', mt: 3 }}>

          {/* Controls */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Kliknutie</Typography>
              <Switch
                checked={dragMode}
                onChange={(e) => setDragMode(e.target.checked)}
                size="small"
              />
              <Typography variant="body2">Presúvanie</Typography>
            </Box>

            {/* Status filter */}
            <Accordion sx={{ flex: 1 }} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Stavy ({selectedStatuses.length}/{filters.statuses.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {filters.statuses.map(status => (
                    <FormControlLabel
                      key={status}
                      control={
                        <Checkbox
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            setSelectedStatuses(prev =>
                              e.target.checked
                                ? [...prev, status]
                                : prev.filter(s => s !== status)
                            );
                          }}
                          size="small"
                        />
                      }
                      label={status}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Priority filter */}
            <Accordion sx={{ flex: 1 }} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Priorita ({selectedPriorities.length}/{filters.priorities.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {filters.priorities.map(priority => (
                    <FormControlLabel
                      key={priority}
                      control={
                        <Checkbox
                          checked={selectedPriorities.includes(priority)}
                          onChange={(e) => {
                            setSelectedPriorities(prev =>
                              e.target.checked
                                ? [...prev, priority]
                                : prev.filter(p => p !== priority)
                            );
                          }}
                          size="small"
                          sx={{
                            color: PRIORITY_COLORS[priority],
                            '&.Mui-checked': { color: PRIORITY_COLORS[priority] }
                          }}
                        />
                      }
                      label={priority}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Graph */}
          <Paper elevation={3} sx={{ width: '100%', height: '600px', position: 'relative' }}>
            <div
              ref={containerRef}
              style={{ width: '100%', height: '100%', background: '#fafafa' }}
            />
          </Paper>

          {/* Legend */}
          <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Legenda</Typography>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                <Typography variant="body2">Používateľ</Typography>
              </Box>
              {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                <Box key={priority} display="flex" alignItems="center" gap={1}>
                  <Box sx={{
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    bgcolor: color
                  }} />
                  <Typography variant="body2">{priority}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Node Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{ '& .MuiDrawer-paper': { width: 400, p: 3 } }}
      >
        {selectedNode && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {selectedNode.nodeType === 'issue' ? 'Detaily problému' : 'Detaily používateľa'}
              </Typography>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {selectedNode.nodeType === 'issue' ? (
              <>
                <Typography variant="subtitle2" color="textSecondary">Kľúč</Typography>
                <Typography variant="body1" mb={2}>{selectedNode.label}</Typography>

                <Typography variant="subtitle2" color="textSecondary">Zhrnutie</Typography>
                <Typography variant="body1" mb={2}>{selectedNode.data.summary}</Typography>

                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip label={selectedNode.data.status} color="primary" size="small" sx={{ mb: 2 }} />

                <Typography variant="subtitle2" color="textSecondary">Priorita</Typography>
                <Chip
                  label={selectedNode.data.priority}
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: PRIORITY_COLORS[selectedNode.data.priority] || '#1976d2',
                    color: 'white'
                  }}
                />

                <Typography variant="subtitle2" color="textSecondary">Typ úlohy</Typography>
                <Typography variant="body1" mb={2}>{selectedNode.data.issueType}</Typography>

                {selectedNode.data.assignee && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">Riešiteľ</Typography>
                    <Typography variant="body1">{selectedNode.data.assignee}</Typography>
                    {selectedNode.data.assigneeEmail && (
                      <Typography variant="body2" color="textSecondary" mb={2}>
                        {selectedNode.data.assigneeEmail}
                      </Typography>
                    )}
                  </>
                )}

                {selectedNode.data.reporter && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">Reportér</Typography>
                    <Typography variant="body1">{selectedNode.data.reporter}</Typography>
                    {selectedNode.data.reporterEmail && (
                      <Typography variant="body2" color="textSecondary" mb={2}>
                        {selectedNode.data.reporterEmail}
                      </Typography>
                    )}
                  </>
                )}

                {selectedNode.data.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="textSecondary">Popis</Typography>
                    <Typography variant="body2" mb={2}>{selectedNode.data.description}</Typography>
                  </>
                )}
              </>
            ) : (
              <>
                <Typography variant="subtitle2" color="textSecondary">Zobrazované meno</Typography>
                <Typography variant="body1" mb={2}>{selectedNode.label}</Typography>

                {selectedNode.data.emailAddress && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1" mb={2}>{selectedNode.data.emailAddress}</Typography>
                  </>
                )}

                {selectedNode.data.avatarUrl && (
                  <Box mt={2}>
                    <img
                      src={selectedNode.data.avatarUrl}
                      alt={selectedNode.label}
                      style={{ width: 48, height: 48, borderRadius: '50%' }}
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Drawer>
    </Container>
  );
};

export default UserGraph;
