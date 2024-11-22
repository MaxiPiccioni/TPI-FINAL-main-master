const express = require("express");
const router = express.Router();
const auth = require("../seguridad/auth");
const db = require("../base-orm/sequelize-init");
const { Op } = require("sequelize");

// GET para todos los empleados con autenticación JWT
router.get("/api/empleadosJWT", auth.authenticateJWT, async function (req, res, next) {
  try {
    const { rol } = res.locals.user;
    if (rol !== "member" && rol !== "admin") {
      return res.status(403).json({ message: "Usuario no autorizado!" });
    }

    const { nombre } = req.query;
    let whereCondition = {};

    if (nombre) {
      whereCondition = {
        nombre_empleado: {
          [Op.like]: `%${nombre}%`,
        },
      };
    }

    const data = await db.Empleados.findAll({
      where: whereCondition,
      attributes: ["id_empleado", "nombre_empleado", "sexo", "fecha_nacimiento"],
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET para los empleados filtrados por id con autenticación JWT
router.get("/api/empleadosJWT/:id", auth.authenticateJWT, async function (req, res) {
  try {
    const { rol } = res.locals.user;
    if (rol !== "admin") {
      return res.status(403).json({ message: "Usuario no autorizado!" });
    }

    const empleado = await db.Empleados.findByPk(req.params.id);
    if (empleado) {
      res.json(empleado);
    } else {
      res.status(404).json({ message: "Empleado no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error en la consulta", error });
  }
});

// POST para crear un nuevo empleado con autenticación JWT
router.post("/api/empleadosJWT", auth.authenticateJWT, async (req, res) => {
  const { rol } = res.locals.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Usuario no autorizado!" });
  }

  const { nombre_empleado, sexo, fecha_nacimiento } = req.body;

  try {
    let nuevoEmpleado = {
      nombre_empleado,
      sexo,
      fecha_nacimiento,
    };

    const empleadoCreado = await db.Empleados.create(nuevoEmpleado);
    res.status(201).json(empleadoCreado);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el empleado", error });
  }
});

// PUT para modificar un empleado con autenticación JWT
router.put("/api/empleadosJWT/:id", auth.authenticateJWT, async (req, res) => {
  const { rol } = res.locals.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Usuario no autorizado!" });
  }

  const { id } = req.params;
  const { nombre_empleado, sexo, fecha_nacimiento } = req.body;

  try {
    const empleado = await db.Empleados.findByPk(id);

    if (empleado) {
      empleado.nombre_empleado = nombre_empleado;
      empleado.sexo = sexo;
      empleado.fecha_nacimiento = fecha_nacimiento;

      await empleado.save();
      res.json({ message: "Empleado actualizado", empleado });
    } else {
      res.status(404).json({ message: "Empleado no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el empleado", error });
  }
});

// DELETE para eliminar un empleado con autenticación JWT
router.delete("/api/empleadosJWT/:id", auth.authenticateJWT, async (req, res) => {
  const { rol } = res.locals.user;
  if (rol !== "admin") {
    return res.status(403).json({ message: "Usuario no autorizado!" });
  }

  const { id } = req.params;

  try {
    const empleado = await db.Empleados.findByPk(id);

    if (empleado) {
      await empleado.destroy();
      res.json({ message: "Empleado eliminado" });
    } else {
      res.status(404).json({ message: "Empleado no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el empleado", error });
  }
});

module.exports = router;
