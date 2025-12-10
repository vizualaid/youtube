//const asyncHandler = (fn) => (req, res, next) => {}
    export {asyncHandler}
    const asyncHandler = (fn) => async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next, fn))
        .catch((error) => next(err));
    }
    // const asyncHandler = (fn) => async(req, res, next) => {
    //     try {
    //         await fn(req, res, next);
    //     }
    //     catch (error) {
    //         res.status(error.code || 500).json({
    //             success: false,
    //             message: error.message || 'Internal Server Error',
    //         });
            
    //     }
    // }