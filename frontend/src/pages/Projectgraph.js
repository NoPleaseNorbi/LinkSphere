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
  Checkbox
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Graph from 'graphology';
import Sigma from 'sigma';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

// Outside the component, at the top of the file
const PRIORITY_COLORS = {
  'Highest': '#c50000',
  'High':    '#f5584c',
  'Medium':  '#ff9800',
  'Low':     '#42a5f5',
  'Lowest':  '#90caf9',
};

const PRIORITY_SIZES = {
  'Highest': 24,
  'High':    20,
  'Medium':  16,
  'Low':     12,
  'Lowest':  10,
};

const ProjectGraph = () => {
  const { projectId } = useParams(); // Get projectId from URL
  const containerRef = useRef(null);
  const sigmaRef = useRef(null);
  const dragModeRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const graphDataRef = useRef(null);
  const [filters, setFilters] = useState({ users: [], statuses: [], priorities: [] });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  useEffect(() => {
    dragModeRef.current = dragMode;
  }, [dragMode]);

  useEffect(() => {
    if (graphDataRef.current) {
      renderGraph(graphDataRef.current, selectedUsers, selectedStatuses, selectedPriorities);
    }
  }, [selectedUsers, selectedStatuses, selectedPriorities]);

  useEffect(() => {
    if (!projectId) return;

    const fetchGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [graphRes, usersRes, statusesRes, prioritiesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/database/graph/${projectId}`),
          fetch(`http://localhost:5000/api/database/graph/users/${projectId}`),
          fetch(`http://localhost:5000/api/database/graph/statuses/${projectId}`),
          fetch(`http://localhost:5000/api/database/graph/priorities/${projectId}`),
        ]);

        if (!graphRes.ok) throw new Error('Nepodarilo sa načítať údaje grafu');

        const data = await graphRes.json();
        const usersData = await usersRes.json();
        const statusesData = await statusesRes.json();
        const prioritiesData = await prioritiesRes.json();

        if (!data.graph.nodes || data.graph.nodes.length === 0) {
          setError('Pre tento projekt sa nenašli žiadne údaje grafu');
          return;
        }

        const allUserIds = usersData.users.map(u => u.accountId);
        const allStatuses = statusesData.statuses;
        const allPriorities = prioritiesData.priorities;

        graphDataRef.current = data.graph;
        setFilters({ users: usersData.users, statuses: allStatuses, priorities: allPriorities });
        setSelectedUsers(allUserIds);
        setSelectedStatuses(allStatuses);
        setSelectedPriorities(allPriorities);

        renderGraph(data.graph, allUserIds, allStatuses, allPriorities);
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
  }, [projectId]);

  const renderGraph = (data, activeUsers, activeStatuses, activePriorities) => {
    if (!containerRef.current) return;

    // Create a new graph
    const graph = new Graph();

    // Define colors for different node types
    const nodeColors = {
      issue: '#1976d2',
      user: '#2e7d32',
    };

    const nodeSizes = {
      issue: 15,
      user: 10,
    };

    // Add nodes
    data.nodes.forEach(node => {
      if (node.type === 'issue') {
        const matchesStatus = !activeStatuses || activeStatuses.includes(node.data.status);
        const matchesPriority = !activePriorities || activePriorities.includes(node.data.priority);
        if (matchesStatus && matchesPriority) {
          graph.addNode(node.id, {
            label: node.label,
            size: PRIORITY_SIZES[node.data.priority] || 15,
            color: PRIORITY_COLORS[node.data.priority] || '#1976d2',
            nodeType: node.type,
            data: node.data,
          });
        }
      }
    });

    // Add user nodes that are selected in filter
    data.nodes.forEach(node => {
      if (node.type === 'user') {
        if (!activeUsers || activeUsers.includes(node.id)) {
          graph.addNode(node.id, {
            label: node.label,
            size: nodeSizes.user,
            color: nodeColors.user,
            nodeType: node.type,
            data: node.data,
          });
        }
      }
    });

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

    // Apply circular layout first (gives initial x,y positions)
    circular.assign(graph);

    // Apply force-directed layout
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, {
      iterations: 50,
      settings: settings,
    });

    // Create Sigma instance
    if (sigmaRef.current) {
      sigmaRef.current.kill();
    }

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: true,
      defaultEdgeType: 'arrow',
      labelSize: 12,
      labelWeight: 'bold',
      allowInvalidContainer: true,
    });

    sigmaRef.current = sigma;

    // Drag'n'drop
    let draggedNode = null;
    let isDragging = false;

    sigma.on('downNode', (e) => {
      if (!dragModeRef.current) return; // ✅ ignore if not in drag mode
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

    sigma.on('clickNode', ({ node }) => {
      if (dragModeRef.current) return; // ignore if in drag mode
      const nodeData = graph.getNodeAttributes(node);
      setSelectedNode({ id: node, ...nodeData });
      setDrawerOpen(true);
    });

    const handleUp = () => {
      if (draggedNode) {
        graph.removeNodeAttribute(draggedNode, 'highlighted');
      }
      isDragging = false;
      draggedNode = null;
    };

    sigma.on('upNode', handleUp);
    sigma.on('upStage', handleUp);

    // Handle node clicks - guard against drag
    sigma.on('clickNode', ({ node }) => {
      if (dragModeRef.current) return; // ignore if in drag mode
      const nodeData = graph.getNodeAttributes(node);
      setSelectedNode({ id: node, ...nodeData });
      setDrawerOpen(true);
    });

    sigma.on('clickStage', () => {
      setDrawerOpen(false);
    });
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {projectId} - Projektový graf
        </Typography>
      </Box>    
      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
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

          <Accordion sx={{ flex: 1 }} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                Používatelia ({selectedUsers.length}/{filters.users.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {filters.users.map(user => (
                  <FormControlLabel
                    key={user.accountId}
                    control={
                      <Checkbox
                        checked={selectedUsers.includes(user.accountId)}
                        onChange={(e) => {
                          setSelectedUsers(prev =>
                            e.target.checked
                              ? [...prev, user.accountId]
                              : prev.filter(id => id !== user.accountId)
                          );
                        }}
                        size="small"
                      />
                    }
                    label={user.displayName}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

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
      )}


      {/* Graph Visualization */}
      {!loading && !error && (
        <Box sx={{ position: 'relative', width: '100%', mt: 3 }}>
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              height: '600px',
              position: 'relative',
            }}
          >
            <div
              ref={containerRef}
              style={{
                width: '100%',
                height: '100%',
                background: '#fafafa',
              }}
            />
          </Paper>

          {/* Legend */}
          <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Legenda</Typography>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                <Typography variant="body2">Používatelia</Typography>
              </Box>
              {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                <Box key={priority} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: PRIORITY_SIZES[priority] / 2, height: PRIORITY_SIZES[priority] / 2, borderRadius: '50%', bgcolor: color }} />
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
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            p: 3,
          },
        }}
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
                <Typography variant="subtitle2" color="textSecondary">
                  Kľúč
                </Typography>
                <Typography variant="body1" mb={2}>
                  {selectedNode.label}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Zhrnutie
                </Typography>
                <Typography variant="body1" mb={2}>
                  {selectedNode.data.summary}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip label={selectedNode.data.status} color="primary" size="small" sx={{ mb: 2 }} />

                <Typography variant="subtitle2" color="textSecondary">
                  Priorita
                </Typography>
                <Chip label={selectedNode.data.priority} color="secondary" size="small" sx={{ mb: 2 }} />

                <Typography variant="subtitle2" color="textSecondary">
                  Typ úlohy
                </Typography>
                <Typography variant="body1" mb={2}>
                  {selectedNode.data.issueType}
                </Typography>
                
                {selectedNode.data.assignee && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Riešiteľ
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {selectedNode.data.assigneeAvatar && (
                        <img
                          src={selectedNode.data.assigneeAvatar}
                          alt={selectedNode.data.assignee}
                          style={{ width: 48, height: 48, borderRadius: '50%' }}
                        />
                      )}
                      <Typography variant="body1">
                        {selectedNode.data.assignee}
                      </Typography>
                    </Box>
                  </>
                )}

                {selectedNode.data.reporter && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reportér
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {selectedNode.data.reporterAvatar && (
                        <img
                          src={selectedNode.data.reporterAvatar}
                          alt={selectedNode.data.reporter}
                          style={{ width: 48, height: 48, borderRadius: '50%' }}
                        />
                      )}
                      <Typography variant="body1">
                        {selectedNode.data.reporter}
                      </Typography>
                    </Box>
                  </>
                )}

                {selectedNode.data.description && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Popis
                    </Typography>
                    <Typography variant="body2" mb={2}>
                      {selectedNode.data.description}
                    </Typography>
                  </>
                )}
              </>
            ) : (
              <>
                <Typography variant="subtitle2" color="textSecondary">
                  Zobrazované meno
                </Typography>
                <Typography variant="body1" mb={2}>
                  {selectedNode.label}
                </Typography>

                {selectedNode.data.emailAddress && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1" mb={2}>
                      {selectedNode.data.emailAddress}
                    </Typography>
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

export default ProjectGraph;