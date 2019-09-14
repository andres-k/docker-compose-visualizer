import YAML from 'yaml'
import DockerServiceImage from './icons/docker-container.svg';
import HostImage from './icons/host.svg';
import VolumeImage from './icons/volume.svg';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

function yamlToGraph (text) {
  return new Promise((resolve, reject) => {

    const compose = YAML.parse(text);

    if (!compose.services) {
      return reject(dvError("No services to graph."))
    }

    const eles = [];

    Object.keys(compose.services).forEach(service => {
      eles.push(constructNode(service, 'service'));
      if (compose.services[service].ports) {
        eles.push(constructNode('host', 'host'));
        compose.services[service].ports.forEach(port => {
          const ports = port.slice(port.indexOf(':') + 1);
          const hostPort = ports.split(':')[0]
          const servicePort = ports.split(':')[1]

          const id = service + '-host:' + ports
          eles.push(constructLink(service, 'host', id, '', servicePort, hostPort));
        })
      }

      if (compose.services[service].volumes) {
        compose.services[service].volumes.forEach(volume => {
          const volumeName = volume.split(":")[0]
          eles.push(constructNode(volumeName, 'volume'));
          eles.push(constructLink(volumeName, service, volumeName + '-' + service, volume));
        })
      }
    });
    return resolve(eles);
  })

}

function constructNode (id, icon) {
  return {
    data: { id }, classes: [icon], group: 'nodes'
  }
}

function constructLink (source, target, id, label, sourceLabel = "", targetLabel = "") {
  return {
    data: { source, target, id, label, 'source-label': sourceLabel, 'target-label': targetLabel }, group: 'edges'
  }
}

function initGraph (eles) {
  cytoscape.use(fcose);
  return cytoscape({
    container: document.getElementById('cytoscape'),
    layout: {
      name: 'fcose',
      nodeDimensionsIncludeLabels: true,
      nodeSeparation: 200,
      idealEdgeLength: 100
    },
    elements: eles,
    style: [
      {
        selector: 'node.service',
        style: {
          'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(DockerServiceImage),
          'background-color': 'white',
          "text-valign": "bottom",
          height: 24,
          width: 24,
          label: "data(id)"
        }
      }, {
        selector: 'node.host',
        style: {
          'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(HostImage),
          'background-color': 'white',
          "text-valign": "bottom",
          height: 48,
          width: 48,
          label: "data(id)"
        }
      }, {
        selector: 'node.volume',
        style: {
          'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(VolumeImage),
          'background-color': 'white',
          "text-valign": "bottom",
          height: 24,
          width: 24,
          label: "data(id)"
        }
      },
      {
        selector: 'edge',
        style: {
          'line-color': 'black',
          label: "data(label)",
          "source-label": (node) => node.data('source-label'),
          "target-label": (node) => node.data('target-label'),
          "text-rotation": "autorotate",
          "curve-style": 'bezier',
          "text-valign": "bottom",
          'text-margin-y': -10,
          'source-text-rotation': 'autorotate',
          'target-text-rotation': 'autorotate',
          'source-text-offset': 30,
          'target-text-offset': 30
        }
      }
    ],
  })
}

export default {
  yamlToGraph, initGraph
}

export { yamlToGraph, initGraph }