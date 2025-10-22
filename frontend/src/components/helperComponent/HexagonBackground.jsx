// import React from "react";
// import Particles from "react-tsparticles";

// const HexagonBackground = () => {
//   const options = {
//     background: {
//       color: "#0f0f0f",
//     },
//     fpsLimit: 60,
//     interactivity: {
//       events: {
//         onHover: {
//           enable: true,
//           mode: "repulse",
//         },
//         resize: true,
//       },
//       modes: {
//         repulse: {
//           distance: 100,
//           duration: 0.4,
//         },
//       },
//     },
//     particles: {
//       color: {
//         value: "#ffffff",
//       },
//       links: {
//         color: "#ffffff",
//         distance: 150,
//         enable: true,
//         opacity: 0.4,
//         width: 1,
//       },
//       collisions: {
//         enable: false,
//       },
//       move: {
//         direction: "none",
//         enable: true,
//         outModes: {
//           default: "bounce",
//         },
//         random: false,
//         speed: 1,
//         straight: false,
//       },
//       number: {
//         density: {
//           enable: true,
//           area: 800,
//         },
//         value: 80,
//       },
//       opacity: {
//         value: 0.5,
//       },
//       shape: {
//         type: "polygon",
//         options: {
//           sides: 6,
//         },
//       },
//       size: {
//         value: { min: 1, max: 5 },
//       },
//     },
//     detectRetina: true,
//   };

//   return <Particles id="tsparticles" options={options} />;
// };

// export default HexagonBackground;

import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const HexagonBackground = () => {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const options = {
    background: {
      color: "#0f0f0f",
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "polygon",
        options: {
          sides: 6,
        },
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  return <Particles id="tsparticles" init={particlesInit} options={options} />;
};

export default HexagonBackground;



// import React from "react";
// import Particles from "react-tsparticles";
// import { loadFull } from "tsparticles";

// const HexagonalParticles = () => {
//   const particlesInit = async (engine) => {
//     await loadFull(engine);
//   };

//   return (
//     <Particles
//       id="hex-particles"
//       init={particlesInit}
//       options={{
//         fullScreen: { enable: false },
//         background: {
//           color: "#0f172a", // dark blue background
//         },
//         particles: {
//           number: {
//             value: 100,
//             density: {
//               enable: false, // disable density to manually control spacing
//             },
//           },
//           color: {
//             value: "#8b5cf6", // purple hexagons
//           },
//           shape: {
//             type: "polygon",
//             options: {
//               polygon: {
//                 sides: 6, // hexagon
//               },
//             },
//           },
//           opacity: {
//             value: 0.7,
//             random: false,
//           },
//           size: {
//             value: 25,
//             random: { enable: true, minimumValue: 15 },
//           },
//           move: {
//             enable: true,
//             speed: 0.5,
//             direction: "none",
//             random: false,
//             straight: false,
//             outModes: "out",
//           },
//           // Position particles in a hexagonal grid
//           // tsparticles supports layout with grid (experimental)
//           // This option helps form the hexagonal lattice
//           // but may require tsparticles 2.9.0+
//           layout: {
//             enable: true,
//             type: "grid",
//             grid: {
//               rows: 10,
//               cols: 12,
//               // spacing is key for hexagonal tiling
//               // spacing horizontally and vertically must fit hexagon size
//               spacing: {
//                 horizontal: 60,
//                 vertical: 52, // ~sqrt(3)/2 * horizontal for hexagons
//               },
//               // stagger rows to form hex lattice pattern
//               stagger: true,
//             },
//           },
//         },
//         interactivity: {
//           events: {
//             onHover: {
//               enable: true,
//               mode: "grab",
//             },
//             onClick: {
//               enable: true,
//               mode: "push",
//             },
//           },
//           modes: {
//             grab: {
//               distance: 140,
//               links: {
//                 opacity: 0.5,
//               },
//             },
//             push: {
//               quantity: 4,
//             },
//           },
//         },
//         // draw connecting lines between close particles
//         links: {
//           enable: true,
//           distance: 75,
//           color: "#8b5cf6",
//           opacity: 0.4,
//           width: 1,
//           // allow linking only between nearby hexagons in the grid
//           triangles: {
//             enable: false,
//           },
//         },
//         detectRetina: true,
//       }}
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         zIndex: -1,
//       }}
//     />
//   );
// };

// export default HexagonalParticles;

