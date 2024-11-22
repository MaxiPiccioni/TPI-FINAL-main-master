import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import httpService from "../services/http.service";

export default function ProductosRegistro({
  AccionABMC,
  Item,
  Grabar,
  Volver,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid, isSubmitted },
  } = useForm({
    values: {
      ...Item,
      fecha_elaboracion: Item.fecha_elaboracion.split(" ")[0],
    },
  });
  const onSubmit = (data) => {
    Grabar(data);
  };

  const [proveedores, setProveedores] = useState([]);
  const [proveedor, setProveedor] = useState(null);

  useEffect(() => {
    getAllProveedores();
  }, []);

  useEffect(() => {
    if (proveedores.length > 0 && Item.id_proveedor) {
      getProveedor(proveedores);
    }
  }, [proveedores, Item.id_proveedor]);

  // TODO: Llevar a un servicio aparte (proveedores.service.js)
  const getAllProveedores = async () => {
    try {
      const response = await httpService.get(
        "http://localhost:3000/api/proveedoresJWT"
      );

      setProveedores(response.data);
    } catch (error) {
      console.log("error al buscar datos en el servidor!");
    }
  };
  const getProveedor = async (proveedores) => {
    const proveedorEncontrado = proveedores.find(
      (x) => x.id_proveedor === Item.id_proveedor
    );
    if (proveedorEncontrado) {
      setProveedor(proveedorEncontrado.nombre_proveedor);
    }
  };

  if (!Item) return null;
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container-fluid">
        <fieldset disabled={AccionABMC === "C"}>
          {/* campo nombre */}
          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label className="col-form-label" htmlFor="nombre_prod">
                Nombre<span className="text-danger">*</span>:
              </label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input
                type="text"
                {...register("nombre_prod", {
                  required: {
                    value: true,
                    message: "Nombre Producto es requerido",
                  },
                  minLength: {
                    value: 4,
                    message: "Nombre Producto debe tener al menos 4 caracteres",
                  },
                  maxLength: {
                    value: 55,
                    message:
                      "Nombre Producto debe tener como máximo 55 caracteres",
                  },
                })}
                autoFocus
                className={
                  "form-control " + (errors?.nombre_prod ? "is-invalid" : "")
                }
              />
              {errors?.nombre_prod && touchedFields.nombre_prod && (
                <div className="invalid-feedback">
                  {errors?.nombre_prod?.message}
                </div>
              )}
            </div>
          </div>

          {/* campo Precio */}
          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label className="col-form-label" htmlFor="precio">
                Precio<span className="text-danger">*</span>:
              </label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input
                type="number"
                step=".01"
                {...register("precio", {
                  required: { value: true, message: "Precio es requerido" },
                  min: {
                    value: 0.01,
                    message: "Precio debe ser mayor a 0",
                  },
                  max: {
                    value: 99999.99,
                    message: "Precio debe ser menor o igual a 99999.99",
                  },
                })}
                className={
                  "form-control " + (errors?.precio ? "is-invalid" : "")
                }
              />
              <div className="invalid-feedback">{errors?.precio?.message}</div>
            </div>
          </div>

          {/* campo fecha_elaboracion */}
          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label className="col-form-label" htmlFor="fecha_elaboracion">
                Fecha Elaboracion<span className="text-danger">*</span>:
              </label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input
                type="date"
                {...register("fecha_elaboracion", {
                  required: {
                    value: true,
                    message: "Fecha de Elaboracion es requerido",
                  },
                })}
                className={
                  "form-control " +
                  (errors?.fecha_elaboracion ? "is-invalid" : "")
                }
              />
              <div className="invalid-feedback">
                {errors?.fecha_elaboracion?.message}
              </div>
            </div>
          </div>

          {/* campo id_proveedor */}
          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label className="col-form-label" htmlFor="id_proveedor">
                Nombre Proveedor<span className="text-danger">*</span>:
              </label>
            </div>
            <div className="col-sm-8 col-md-6">
              {AccionABMC === "C" ? (
                <input
                  type="text"
                  className="form-control"
                  value={proveedor || ""} // Asegúrate de manejar este valor en tu estado
                  readOnly
                />
              ) :
                (
                  <select
                    {...register("id_proveedor", {
                      required: {
                        value: true,
                        message: "Nombre del Proveedor es requerido",
                      },
                    })}
                    className={
                      "form-control " + (errors?.id_proveedor ? "is-invalid" : "")
                    }
                  >
                    <option value="" key={1}></option>
                    {proveedores?.map((x) => (
                      <option value={x.id_proveedor} key={x.id_proveedor}>
                        {x.nombre_proveedor}
                      </option>
                    ))}
                  </select>
                )}
              <div className="invalid-feedback">
                {errors?.id_proveedor?.message}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Botones Grabar, Cancelar/Volver' */}
        <hr />
        <div className="row justify-content-center">
          <div className="col text-center botones">
            {AccionABMC !== "C" && (
              <button type="submit" className="btn btn-primary">
                <i className="fa fa-check"></i> Grabar
              </button>
            )}
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => Volver()}
            >
              <i className="fa fa-undo"></i>
              {AccionABMC === "C" ? " Volver" : " Cancelar"}
            </button>
          </div>
        </div>

        {/* texto: Revisar los datos ingresados... */}
        {!isValid && isSubmitted && (
          <div className="row alert alert-danger mensajesAlert">
            <i className="fa fa-exclamation-sign"></i>
            Revisar los datos ingresados...
          </div>
        )}
      </div>
    </form>
  );
}
