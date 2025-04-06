import React, { useState, useCallback } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Panel,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const flowKey = "example-flow";

const getNodeId = () => `randomnode_${+new Date()}`;

const initialNodes = [
  { id: "1", data: { label: "Node 1" }, position: { x: 0, y: -50 } },
  { id: "2", data: { label: "Node 2" }, position: { x: 0, y: 50 } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const SaveRestore = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const onLocalStorageSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onPersistentSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onLocalStorageRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onPersistentRestore = useCallback(() => {
    const restoreFlow = async () => {
      let flow2 = null;

      await fetch("/data/loadSuccessPath")
        .then((response) => response.json())
        .then((json) => (flow2 = json));

      //   await fetch(
      //     "https://saa-success-path.s3.us-east-2.amazonaws.com/path.json"
      //   )
      //     .then((response) => response.json())
      //     .then((json) => (flow2 = json));

      console.log(flow2);

      if (flow2) {
        const { x = 0, y = 0, zoom = 1 } = flow2.viewport;
        setNodes(flow2.nodes || []);
        setEdges(flow2.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onAdd = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      data: { label: "Added node" },
      position: {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={setRfInstance}
      fitView
      fitViewOptions={{ padding: 2 }}
      style={{ backgroundColor: "#F7F9FB" }}
    >
      <Background />
      <Panel position="top-right">
        <button onClick={onLocalStorageSave}>Temp Save</button>
        <button onClick={onLocalStorageRestore}>Temp Restore</button>
        <button onClick={onPersistentSave}>Save</button>
        <button onClick={onPersistentRestore}>Restore</button>
        <button onClick={onAdd}>add node</button>
      </Panel>
    </ReactFlow>
  );
};

export default () => (
  <ReactFlowProvider>
    <SaveRestore />
  </ReactFlowProvider>
);
